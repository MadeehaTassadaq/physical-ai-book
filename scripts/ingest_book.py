#!/usr/bin/env python3
"""
Book ingestion script using BeautifulSoup, Cohere embeddings, and Qdrant storage.
This script scrapes the published book URL, generates Cohere embeddings,
and upserts them into a Qdrant collection named humanoid_robotics_docs.
"""

import os
import requests
from bs4 import BeautifulSoup
import cohere
from qdrant_client import QdrantClient
from qdrant_client.http import models
import time
import logging
from typing import List, Dict, Any


class BookScraper:
    """Scraper for the published book URL."""

    def __init__(self, base_url: str):
        self.base_url = base_url
        self.session = requests.Session()
        self.session.headers.update({
            'User-Agent': 'Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/91.0.4472.124 Safari/537.36'
        })

    def scrape_page(self, url: str) -> str:
        """Scrape HTML content from a URL."""
        try:
            response = self.session.get(url, timeout=30)
            response.raise_for_status()
            return response.text
        except requests.RequestException as e:
            logging.error(f"Failed to scrape {url}: {e}")
            return ""

    def extract_content_by_headers(self, html: str, url: str) -> List[Dict[str, Any]]:
        """Extract content chunks based on headers (h1, h2, h3)."""
        soup = BeautifulSoup(html, 'html.parser')

        # Remove script and style elements
        for script in soup(["script", "style"]):
            script.decompose()

        # Find all headers (h1, h2, h3)
        headers = soup.find_all(['h1', 'h2', 'h3'])

        chunks = []

        if not headers:
            # If no headers found, use the entire content as one chunk
            text_content = soup.get_text(separator=' ', strip=True)
            if text_content:
                chunks.append({
                    'url': url,
                    'title': soup.title.string if soup.title else 'No Title',
                    'content': text_content,
                    'header_type': 'none'
                })
        else:
            # Process content under each header
            for i, header in enumerate(headers):
                header_text = header.get_text(strip=True)
                header_type = header.name

                # Find the next header to determine content boundaries
                next_header = None
                if i + 1 < len(headers):
                    next_header = headers[i + 1]

                # Get content between this header and the next
                content_elements = []
                current = header.next_sibling

                while current:
                    if current == next_header:
                        break
                    if hasattr(current, 'name') and current.name in ['h1', 'h2', 'h3']:
                        break
                    if hasattr(current, 'get_text'):
                        content_elements.append(current.get_text(separator=' ', strip=True))
                    elif isinstance(current, str) and current.strip():
                        content_elements.append(current.strip())
                    current = current.next_sibling

                content = ' '.join(content_elements).strip()

                # Combine header text with content
                full_content = f"{header_text} {content}".strip()

                if full_content:
                    chunks.append({
                        'url': url,
                        'title': header_text,
                        'content': full_content,
                        'header_type': header_type
                    })

        return chunks


class CohereEmbedder:
    """Generate embeddings using Cohere API."""

    def __init__(self, api_key: str):
        self.client = cohere.Client(api_key)
        self.model = "embed-english-v3.0"  # 1024-dimensional vectors

    def generate_embeddings(self, texts: List[str]) -> List[List[float]]:
        """Generate embeddings for a list of texts."""
        if not texts:
            return []

        try:
            # Process in batches to respect API limits
            batch_size = 96  # Cohere's max batch size
            all_embeddings = []

            for i in range(0, len(texts), batch_size):
                batch = texts[i:i + batch_size]
                response = self.client.embed(
                    texts=batch,
                    model=self.model,
                    input_type="search_document"
                )
                all_embeddings.extend(response.embeddings)

                # Add a small delay to respect rate limits
                time.sleep(0.1)

            return all_embeddings
        except Exception as e:
            logging.error(f"Failed to generate embeddings: {e}")
            return [[] for _ in texts]


class QdrantStorage:
    """Store embeddings in Qdrant collection."""

    def __init__(self, url: str, api_key: str, collection_name: str = "humanoid_robotics_docs"):
        self.client = QdrantClient(
            url=url,
            api_key=api_key,
            prefer_grpc=False
        )
        self.collection_name = collection_name

    def create_collection(self):
        """Create the collection if it doesn't exist."""
        try:
            self.client.get_collection(self.collection_name)
            logging.info(f"Collection {self.collection_name} already exists")
        except:
            # Collection doesn't exist, create it
            self.client.create_collection(
                collection_name=self.collection_name,
                vectors_config=models.VectorParams(
                    size=1024,  # Cohere embed-english-v3.0 produces 1024-dim vectors
                    distance=models.Distance.COSINE
                )
            )
            logging.info(f"Created collection {self.collection_name}")

    def upsert_chunks(self, chunks: List[Dict[str, Any]], embeddings: List[List[float]]):
        """Upsert chunks with embeddings into Qdrant."""
        points = []

        for i, (chunk, embedding) in enumerate(zip(chunks, embeddings)):
            if not embedding or len(embedding) == 0:  # Skip chunks that failed to embed
                continue

            point = models.PointStruct(
                id=i,
                vector=embedding,
                payload={
                    "url": chunk['url'],
                    "title": chunk['title'],
                    "content": chunk['content'][:10000],  # Limit content size to prevent storage issues
                    "header_type": chunk['header_type'],
                    "content_type": "book_content"
                }
            )
            points.append(point)

        if points:
            self.client.upsert(
                collection_name=self.collection_name,
                points=points
            )
            logging.info(f"Upserted {len(points)} points into {self.collection_name}")


def main():
    """Main ingestion function."""
    logging.basicConfig(level=logging.INFO, format='%(asctime)s - %(levelname)s - %(message)s')

    # Get configuration from environment variables
    book_url = os.getenv("BOOK_URL", "https://madeehatassadaq.github.io/physical-ai-book/")
    cohere_api_key = os.getenv("COHERE_API_KEY")
    qdrant_url = os.getenv("QDRANT_URL")
    qdrant_api_key = os.getenv("QDRANT_API_KEY")
    collection_name = os.getenv("QDRANT_COLLECTION", "humanoid_robotics_docs")

    # Validate required environment variables
    if not all([cohere_api_key, qdrant_url, qdrant_api_key]):
        raise ValueError(
            "Missing required environment variables: "
            "COHERE_API_KEY, QDRANT_URL, QDRANT_API_KEY"
        )

    logging.info(f"Starting ingestion from {book_url}")

    # Initialize components
    scraper = BookScraper(book_url)
    embedder = CohereEmbedder(cohere_api_key)
    storage = QdrantStorage(qdrant_url, qdrant_api_key, collection_name)

    # Scrape the book content
    logging.info("Scraping book content...")
    html_content = scraper.scrape_page(book_url)

    if not html_content:
        logging.error("Failed to scrape content, exiting.")
        return

    # Extract content by headers
    logging.info("Extracting content by headers...")
    chunks = scraper.extract_content_by_headers(html_content, book_url)
    logging.info(f"Extracted {len(chunks)} content chunks")

    if not chunks:
        logging.error("No content extracted, exiting.")
        return

    # Prepare texts for embedding
    texts = [chunk['content'] for chunk in chunks]

    # Create Qdrant collection
    logging.info(f"Creating/verifying collection: {collection_name}")
    storage.create_collection()

    # Generate embeddings
    logging.info("Generating embeddings...")
    embeddings = embedder.generate_embeddings(texts)
    logging.info(f"Generated {len(embeddings)} embeddings")

    # Store in Qdrant
    logging.info("Upserting embeddings to Qdrant...")
    storage.upsert_chunks(chunks, embeddings)

    logging.info("Ingestion completed successfully!")


if __name__ == "__main__":
    main()