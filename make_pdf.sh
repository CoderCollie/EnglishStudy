#!/bin/bash

# [Programmer's English Refactoring] Extreme Screen Fit for 14" MacBook
# 상하 여백 0mm, 좌우 5mm 적용 (화면 꽉 채우기 모드)

COMBINED_MD="Everyday_English_Full.md"
PDF_FILE="Everyday_English_Full.pdf"
CHAPTERS_DIR="chapters_basic"
TOC_FILE="TOC_basic.md"

echo "🚀 [1/3] 마크다운 파일 병합 및 여백 제로 스타일 적용..."

# 1. 통합 마크다운 파일 초기화 및 여백 제거 CSS 추가
cat <<EOF > $COMBINED_MD
<style>
@import url('https://fonts.googleapis.com/css2?family=Noto+Sans+KR:wght@400;700&display=swap');

/* PDF 판형 및 여백 제거 설정 */
@page {
    size: 155mm 230mm;
    margin: 0mm 5mm; /* 상하 여백 0, 좌우 최소 여백 5mm */
}

body {
    font-family: 'Noto Sans KR', sans-serif;
    font-size: 18px; 
    line-height: 1.5;
    color: #222;
    margin: 0;
    padding: 10px 10px; /* 내부 패딩으로 글자가 잘리지 않게 조정 */
}

h1 { 
    font-size: 2.2em; 
    color: #2c3e50; 
    border-bottom: 3px solid #2c3e50; 
    padding-bottom: 10px; 
    margin-top: 10px; 
    text-align: center; 
}

h2 { 
    font-size: 1.6em;
    color: #2980b9; 
    margin-top: 20px; 
    border-bottom: 1px solid #eee;
    padding-bottom: 5px;
}

h4 { 
    font-size: 1.2em;
    color: #e67e22; 
    margin-top: 15px; 
    font-weight: bold;
}

blockquote {
    background: #fdfaf6;
    border-left: 6px solid #34495e;
    margin: 1em 0;
    padding: 0.8em 15px;
    color: #444;
    border-radius: 0 5px 5px 0;
}

code { 
    background: #f0f0f0; 
    padding: 2px 4px; 
    border-radius: 3px; 
    font-family: 'Courier New', monospace;
    font-weight: bold;
    color: #c0392b;
}

.page-break { page-break-after: always; }
</style>

# [Programmer's English Refactoring]
## Everyday English Basic 100 Course
### Zero Margin Mode

<div class="page-break"></div>

EOF

# 2. 목차(TOC) 추가
if [ -f "$TOC_FILE" ]; then
    echo "Adding Table of Contents..."
    echo "## Table of Contents" >> $COMBINED_MD
    cat "$TOC_FILE" >> $COMBINED_MD
    echo -e "\n<div class='page-break'></div>\n" >> $COMBINED_MD
fi

# 3. 각 챕터 숫자 순서대로 병합
ls $CHAPTERS_DIR/*.md | sort -V | while read -r file; do
    echo "Merging $file..."
    cat "$file" >> $COMBINED_MD
    echo -e "\n<div class='page-break'></div>\n" >> $COMBINED_MD
done

echo "✅ [2/3] 마크다운 병합 완료: $COMBINED_MD"

# 4. PDF 변환 실행
echo "📂 [3/3] PDF 변환 시작 (여백 제로 모드)..."

if command -v npx &> /dev/null; then
    npx md-to-pdf $COMBINED_MD
    if [ $? -eq 0 ]; then
        echo "🎉 성공! 여백을 완전히 제거한 PDF 파일이 생성되었습니다: $PDF_FILE"
    else
        echo "❌ PDF 변환 중 오류가 발생했습니다."
    fi
else
    echo "⚠️ 'npx' 명령어를 찾을 수 없습니다."
fi
