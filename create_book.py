import os
import re

def create_combined_markdown():
    # 1. 대상 디렉토리 및 파일 설정
    basic_dir = 'chapters_basic'
    output_file = 'Everyday_English_Full.md'
    toc_file = 'TOC_basic.md'
    
    # 2. 파일 목록 가져오기 및 정렬 (숫자 순)
    files = [f for f in os.listdir(basic_dir) if f.endswith('.md')]
    files.sort(key=lambda x: int(re.findall(r'\d+', x)[0]))
    
    with open(output_file, 'w', encoding='utf-8') as outfile:
        # 타이틀 페이지 추가
        outfile.write("# [Programmer's English Refactoring]\n")
        outfile.write("## Everyday English Basic 100 Course\n")
        outfile.write("\n---\n\n")
        outfile.write("<div style='page-break-after: always;'></div>\n\n")
        
        # 목차 추가
        if os.path.exists(toc_file):
            with open(toc_file, 'r', encoding='utf-8') as toc:
                outfile.write(toc.read())
                outfile.write("\n\n<div style='page-break-after: always;'></div>\n\n")
        
        # 각 챕터 병합
        for filename in files:
            file_path = os.path.join(basic_dir, filename)
            with open(file_path, 'r', encoding='utf-8') as infile:
                content = infile.read()
                # 챕터 제목을 h2로 조정하거나 서식 유지
                outfile.write(content)
                # 챕터 간 페이지 나누기 추가
                outfile.write("\n\n<div style='page-break-after: always;'></div>\n\n")
                
    print(f"✅ Successfully created: {output_file}")
    print(f"🚀 Now you can convert this to PDF using 'md-to-pdf' or Pandoc.")

if __name__ == "__main__":
    create_combined_markdown()
