import sys
import cv2
import numpy as np
import os

def remove_watermark(input_path, output_path):
    """
    Removes watermark (assumed at bottom) using Telea Inpainting.
    Preserves image dimensions.
    """
    try:
        # 1. Read Image
        img = cv2.imread(input_path)
        if img is None:
            raise Exception("Could not read image")

        h, w = img.shape[:2]

        # 2. Define Mask (Bottom 15% where logo usually is)
        # In a real AI model, we would detect the logo. 
        # Here we use heuristic: Sahibinden/Branding is usually at the bottom.
        mask_height = int(h * 0.15) 
        mask = np.zeros((h, w), dtype=np.uint8)
        
        # White rectangle at the bottom (The area to inpaint)
        cv2.rectangle(mask, (0, h - mask_height), (w, h), (255), -1)

        # 3. Apply Inpainting
        # Radius 3, flag cv2.INPAINT_TELEA
        result = cv2.inpaint(img, mask, 3, cv2.INPAINT_TELEA)

        # 4. Save
        cv2.imwrite(output_path, result)
        print(f"SUCCESS:{output_path}")

    except Exception as e:
        print(f"ERROR:{str(e)}")
        sys.exit(1)

if __name__ == "__main__":
    if len(sys.argv) < 3:
        print("Usage: python watermark_remover.py <input_path> <output_path>")
        sys.exit(1)
    
    input_file = sys.argv[1]
    output_file = sys.argv[2]
    
    remove_watermark(input_file, output_file)
