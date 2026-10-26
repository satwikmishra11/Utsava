import os
import sys
from PIL import Image, ImageChops

def compare_images(baseline_path: str, current_path: str) -> int:
    img1 = Image.open(baseline_path).convert('RGBA')
    img2 = Image.open(current_path).convert('RGBA')
    if img1.size != img2.size:
        print(f"Dimension mismatch: {img1.size} vs {img2.size}")
        return 999999
    diff = ImageChops.difference(img1, img2)
    bbox = diff.getbbox()
    if not bbox:
        return 0
    diff_data = diff.getdata()
    diff_pixels = sum(1 for pixel in diff_data if any(channel > 0 for channel in pixel))
    return diff_pixels

def main():
    base_dir = os.path.join(os.getcwd(), '.screenshots', 'baseline')
    curr_dir = os.path.join(os.getcwd(), '.screenshots', 'current')
    if not os.path.isdir(base_dir) or not os.path.isdir(curr_dir):
        print("Missing baseline or current screenshot directory")
        sys.exit(1)

    baseline_files = sorted(f for f in os.listdir(base_dir) if f.endswith('.png'))
    total_diffs = 0
    for filename in baseline_files:
        base_file = os.path.join(base_dir, filename)
        curr_file = os.path.join(curr_dir, filename)
        if not os.path.isfile(curr_file):
            print(f"Missing current screenshot: {filename}")
            total_diffs += 1
            continue
        diff_count = compare_images(base_file, curr_file)
        if diff_count > 0:
            print(f"FAIL: {filename} has {diff_count} differing pixels!")
            total_diffs += diff_count
        else:
            print(f"PASS: {filename} identical")

    if total_diffs > 0:
        print(f"FAILED with {total_diffs} pixel differences!")
        sys.exit(1)
    else:
        print("SUCCESS: 100% pixel identical across all screenshots!")
        sys.exit(0)

if __name__ == '__main__':
    main()
