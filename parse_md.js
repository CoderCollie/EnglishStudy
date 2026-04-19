const fs = require('fs');
const path = require('path');

const chaptersDir = path.join(__dirname, 'chapters_basic');
const outputFile = path.join(__dirname, 'chapter_data.json');

function parseMarkdownToJSON() {
    if (!fs.existsSync(chaptersDir)) {
        console.error("❌ chapters_basic 디렉토리를 찾을 수 없습니다.");
        return;
    }

    const files = fs.readdirSync(chaptersDir).filter(f => f.endsWith('.md'));
    
    // 파일명 안의 숫자를 기준으로 정렬 (01, 02, ... 10, 11)
    files.sort((a, b) => {
        const numA = parseInt(a.match(/\d+/)[0]);
        const numB = parseInt(b.match(/\d+/)[0]);
        return numA - numB;
    });

    const parsedData = [];

    files.forEach(file => {
        const content = fs.readFileSync(path.join(chaptersDir, file), 'utf-8');
        
        // 1. 챕터 제목 추출 (# Ch 1. ...)
        const titleMatch = content.match(/^#\s+(.+)$/m);
        const chapterTitle = titleMatch ? titleMatch[1].trim() : file;

        // 2. Core Meaning 추출 (예: "나 영화 보러 가고 싶어." (I want to watch a movie.))
        // 정규식: "한국어" (English) 형태를 찾음
        const coreMeaningMatch = content.match(/####\s+\*\*1\.\s+Core\s+Meaning\*\*[\s\S]*?"(.*?)"\s+\((.*?)\)/);
        const coreMeaningKr = coreMeaningMatch ? coreMeaningMatch[1].trim() : "";
        const coreMeaningEn = coreMeaningMatch ? coreMeaningMatch[2].trim() : "";

        // 3. 10 Variations 추출
        // 각 번호별로 [문장, 직역, 의역, 상세분석]을 덩어리로 가져옴
        const variations = [];
        // 업데이트된 고밀도 해설 포맷에 맞춘 정규식
        const variationBlocks = content.split(/\n(?=\d+\.\s+\*\*)/).slice(1); // 숫자로 시작하는 지점부터 쪼갬

        variationBlocks.forEach(block => {
            const sentenceMatch = block.match(/^\d+\.\s+\*\*(.*?)\*\*/);
            const literalMatch = block.match(/\[직역\/의역\]:\s*(.*?)\s*\/\s*"(.*?)"/);
            
            // 상세 분석은 [Vocabulary & Nuance] 뒤의 모든 텍스트
            const nuanceMatch = block.match(/\[Vocabulary\s*&\s*Nuance\]:\s*([\s\S]*?)(?=\n\d+\.\s+\*\*|---|$)/);

            if (sentenceMatch) {
                variations.push({
                    sentence: sentenceMatch[1].replace(/^"|"$/g, '').trim(),
                    literalTranslation: literalMatch ? literalMatch[1].trim() : "",
                    meaning: literalMatch ? literalMatch[2].trim() : "",
                    nuance: nuanceMatch ? nuanceMatch[1].trim() : ""
                });
            }
        });

        parsedData.push({
            id: parseInt(file.match(/\d+/)[0]),
            title: chapterTitle,
            coreMeaning: {
                kr: coreMeaningKr,
                en: coreMeaningEn
            },
            variations: variations
        });
    });

    fs.writeFileSync(outputFile, JSON.stringify(parsedData, null, 2), 'utf-8');
    console.log(`✅ 총 ${files.length}개의 파일을 파싱하여 ${outputFile}을 생성했습니다.`);
}

parseMarkdownToJSON();
