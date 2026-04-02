import pandas as pd
import os
import json

excel_path = r"data\제9차 한국표준질병ㆍ사인분류 DB masterfile_251223_20251223031826.xlsx"

def analyze_main_data_by_index():
    print(f"Reading Sheet 2 (Index 1)...")
    try:
        # Load the second sheet by index
        xl = pd.ExcelFile(excel_path)
        sheet_name = xl.sheet_names[1]
        print(f"Loading Sheet: {sheet_name}")
        
        df = pd.read_excel(excel_path, sheet_name=sheet_name)
        
        print(f"\n--- Main Data Columns ---")
        print(df.columns.tolist())
        
        print(f"\n--- Shape ---")
        print(df.shape)
        
        # Save a sample 
        sample_data = df.head(50).to_dict(orient='records')
        with open("kcd_main_sample.json", "w", encoding="utf-8") as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
        
        print("\n--- Summary of first 5 rows ---")
        print(df.head(5).to_string())
            
    except Exception as e:
        print(f"Analysis Failed: {str(e)}")

if __name__ == "__main__":
    analyze_main_data_by_index()
