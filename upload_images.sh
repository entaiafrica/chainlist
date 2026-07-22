#!/bin/bash

OUTPUT_FILE="/root/.gemini/tmp/be5ed5ab6e2ce44ea4d006e76c732ba80dfe0074ac3ca2fcd687a93/ipfs_upload/ipfs_hashes.txt"
IMAGE_DIR="/opt/facebrick/tempimages"

# Clear previous output
> "$OUTPUT_FILE"

for image_file in "$IMAGE_DIR"/*; do
  if [ -f "$image_file" ]; then
    filename=$(basename "$image_file")
    echo "Uploading $filename to IPFS..."
    # Add the file to IPFS and extract the hash
    ipfs_output=$(ipfs add --quieter "$image_file")
    ipfs_hash="$ipfs_output"
    
    if [ -n "$ipfs_hash" ]; then
      echo "$filename,$ipfs_hash" >> "$OUTPUT_FILE"
      echo "Uploaded $filename with hash $ipfs_hash"
    else
      echo "Failed to upload $filename to IPFS."
    fi
  fi
done

echo "IPFS upload complete. Hashes saved to $OUTPUT_FILE"
cat "$OUTPUT_FILE"
