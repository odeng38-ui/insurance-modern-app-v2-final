import pandas as pd
import os
import json

excel_path = r"data\제9차 한국표준질병ㆍ사인분류 DB masterfile_251223_20251223031826.xlsx"

def analyze_excel():
    print(f"Reading: {excel_path}")
    try:
        # Check sheet names
        xl = pd.ExcelFile(excel_path)
        print(f"Sheets identified: {xl.sheet_names}")
        
        # Load the first sheet
        df = pd.read_excel(excel_path, sheet_name=xl.sheet_names[0])
        
        print(f"\n--- Column Info ---")
        print(df.columns.tolist())
        
        print(f"\n--- Shape ---")
        print(df.shape)
        
        print(f"\n--- First 5 rows ---")
        print(df.head(5).to_string())
        
        # Save a sample to a temporary file for my analysis
        sample_data = df.head(50).to_dict(orient='records')
        with open("data_sample.json", "w", encoding="utf-8") as f:
            json.dump(sample_data, f, ensure_ascii=False, indent=2)
            
    except Exception as e:
        print(f"Analysis Failed: {str(e)}")

if __name__ == "__main__":
    analyze_excel()
