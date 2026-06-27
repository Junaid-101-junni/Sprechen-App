#!/usr/bin/env python3
"""Generate PWA icons for Juni Boli Talk app"""
import struct
import zlib

def create_png(width, height, filepath):
    """Create a simple PNG with a gradient background and 'J' letter"""
    # Create pixel data (RGBA)
    pixels = []
    for y in range(height):
        row = []
        for x in range(width):
            # Gradient from amber to green (diagonal)
            t = (x + y) / (width + height)
            # Amber: (212, 160, 90), Green: (96, 153, 120)
            r = int(212 * (1 - t) + 96 * t)
            g = int(160 * (1 - t) + 153 * t)
            b = int(90 * (1 - t) + 120 * t)

            # Draw 'J' letter in white in center
            cx, cy = width // 2, height // 2
            size = int(width * 0.35)
            # J shape: vertical bar + bottom curve
            in_j = False
            # Vertical bar (right portion)
            if abs(x - cx) < size // 4 and y < cy + size // 2 and y > cy - size:
                in_j = True
            # Bottom horizontal bar
            if abs(y - (cy + size // 2)) < size // 6 and x < cx + size // 4 and x > cx - size // 2:
                in_j = True
            # Bottom-left curve (simplified)
            dx = x - (cx - size // 3)
            dy = y - (cy + size // 3)
            if dx * dx + dy * dy < (size // 3) * (size // 3) and x < cx:
                in_j = True

            if in_j:
                row.extend([255, 255, 255, 255])
            else:
                row.extend([r, g, b, 255])
        pixels.append(row)

    # Encode PNG
    def make_chunk(chunk_type, data):
        c = chunk_type + data
        crc = struct.pack('>I', zlib.crc32(c) & 0xffffffff)
        return struct.pack('>I', len(data)) + c + crc

    # PNG signature
    signature = b'\x89PNG\r\n\x1a\n'

    # IHDR chunk
    ihdr_data = struct.pack('>IIBBBBB', width, height, 8, 6, 0, 0, 0)
    ihdr = make_chunk(b'IHDR', ihdr_data)

    # IDAT chunk (image data)
    raw_data = b''
    for row in pixels:
        raw_data += b'\x00'  # filter type none
        raw_data += bytes(row)

    compressed = zlib.compress(raw_data)
    idat = make_chunk(b'IDAT', compressed)

    # IEND chunk
    iend = make_chunk(b'IEND', b'')

    with open(filepath, 'wb') as f:
        f.write(signature + ihdr + idat + iend)

    print(f"Created {filepath} ({width}x{height})")

create_png(192, 192, '/home/z/my-project/public/icon-192.png')
create_png(512, 512, '/home/z/my-project/public/icon-512.png')
print("Done!")
