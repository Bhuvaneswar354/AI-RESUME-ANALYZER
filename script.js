// Replace with YOUR Gemini API Key
const API_KEY = "AQ.Ab8RN6IwPvQhu6mdfn8Vh9uupwm9SFiwdcrGVJFZuwZ66ZcP9A";



// ===== Extract text from PDF =====
async function extractPDFText(file) {
    const arrayBuffer = await file.arrayBuffer();

    const pdf = await pdfjsLib.getDocument({
        data: arrayBuffer
    }).promise;

    let text = "";

    for (let pageNum = 1; pageNum <= pdf.numPages; pageNum++) {
        const page = await pdf.getPage(pageNum);
        const content = await page.getTextContent();

        text += content.items.map(item => item.str).join(" ");
        text += "\n";
    }

    return text;
}

// ===== Analyze Resume =====
async function analyzeResume() {

    const file = document.getElementById("resumeFile").files[0];

    if (!file) {
        alert("Please upload a PDF or TXT resume.");
        return;
    }

    document.getElementById("loading").innerHTML = "⏳ Analyzing Resume...";
    document.getElementById("result").innerHTML = "";

    let resumeText = "";

    try {

        // Read PDF or TXT
        if (file.type === "application/pdf") {
            resumeText = await extractPDFText(file);
        } else {
            resumeText = await file.text();
        }

        const prompt = `
You are an AI Resume Analyzer for Engineering Students.

Analyze the following resume and provide:

1. Candidate Summary
2. Technical Skills
3. Soft Skills
4. ATS Score (out of 100) with explanation
5. Missing Skills
6. Resume Improvement Suggestions
7. Recommended Job Roles
8. Five Interview Questions

Resume:
${resumeText}
`;

        const response = await fetch(
            `https://generativelanguage.googleapis.com/v1beta/models/gemini-3.5-flash-lite:generateContent?key=${API_KEY}`,
            {
                method: "POST",
                headers: {
                    "Content-Type": "application/json"
                },
                body: JSON.stringify({
                    contents: [
                        {
                            parts: [
                                { text: prompt }
                            ]
                        }
                    ]
                })
            }
        );

        const data = await response.json();

        document.getElementById("loading").innerHTML = "";

        if (response.ok && data.candidates) {
            document.getElementById("result").innerHTML =
                data.candidates[0].content.parts[0].text;
        } else {
            document.getElementById("result").innerHTML =
                "❌ Error:\n" + JSON.stringify(data, null, 2);
        }

    } catch (error) {
        document.getElementById("loading").innerHTML = "";
        document.getElementById("result").innerHTML =
            "❌ Something went wrong.\n\n" + error.message;
    }
}