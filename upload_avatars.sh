#!/bin/bash

OUTPUT_FILE="/root/.gemini/tmp/be5ed5ab6e2ce44ea4d006e76c732ba80dfe0074ac3ca2fcd687a98a16cf1a93/ipfs_upload/avatar_hashes.txt"
IMAGE_DIR="/opt/facebrick/generated_avatars"

# Create output directory
mkdir -p "$(dirname "$OUTPUT_FILE")"

# Clear previous output
> "$OUTPUT_FILE"

for image_file in "$IMAGE_DIR"/*.svg; do
  if [ -f "$image_file" ]; then
    filename=$(basename "$image_file")
    echo "Uploading $filename to IPFS..."
    
    # Copy file to the container to make it accessible to ipfs add
    docker cp "$image_file" "facebrick-ipfs:/data/ipfs/$filename"

    # Add the file to IPFS and extract the hash
    ipfs_hash=$(docker exec facebrick-ipfs ipfs add -q "/data/ipfs/$filename")
    
    # Remove the file from the container after adding
    docker exec facebrick-ipfs rm "/data/ipfs/$filename"

    if [ -n "$ipfs_hash" ]; then
      # Save address (filename without .svg) and hash
      address=${filename%.svg}
      echo "$address,$ipfs_hash" >> "$OUTPUT_FILE"
      echo "Uploaded $filename for address $address with hash $ipfs_hash"
    else
      echo "Failed to upload $filename to IPFS."
    fi
  fi
done

echo "IPFS upload complete. Hashes saved to $OUTPUT_FILE"
cat "$OUTPUT_FILE"
