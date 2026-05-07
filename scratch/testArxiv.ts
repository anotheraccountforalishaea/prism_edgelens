import { fetchArxivPapers } from "../src/retrieval/arxivClient";

async function test() {
    console.log("Testing ArXiv with 'speech recognition'...");
    const papers1 = await fetchArxivPapers("speech recognition");
    console.log(`Found ${papers1.length} papers`);

    console.log("\nTesting ArXiv with 'speech-recognition'...");
    const papers2 = await fetchArxivPapers("speech-recognition");
    console.log(`Found ${papers2.length} papers`);
    
    console.log("\nTesting ArXiv with 'nlp'...");
    const papers3 = await fetchArxivPapers("nlp");
    console.log(`Found ${papers3.length} papers`);
}

test();
