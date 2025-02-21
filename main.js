const OpenAI = require("openai");
const fs = require('fs');
const path = require('path');
require('dotenv').config();

const openai = new OpenAI({ apiKey: process.env.OPENAI_API_KEY });

async function getPrompt(workflow) {
    const response = await openai.chat.completions.create({
        model: "gpt-4o-mini",
        messages: [{ role: "system", content: "Generate a prompt for the following workflow:" }, { role: "user", content: JSON.stringify(workflow) }],
        max_tokens: 100
    });
    return response.choices[0].message.content.trim();
}

async function processWorkflows(inputFilePath, outputFilePath) {
    const workflows = JSON.parse(fs.readFileSync(inputFilePath, 'utf8'));
    const jsonlData = [];

    for (const workflow of workflows) {
        const prompt = await getPrompt(workflow);
        const name = workflow.name || "Unnamed Workflow";
        jsonlData.push({ prompt, name, workflow });
    }

    const jsonlContent = jsonlData.map(item => JSON.stringify(item)).join('\n');
    fs.writeFileSync(outputFilePath, jsonlContent, 'utf8');
}

const inputFilePath = path.join(__dirname, 'workflows.json');
const outputFilePath = path.join(__dirname, 'fine_tuning_data.jsonl');

processWorkflows(inputFilePath, outputFilePath)
    .then(() => console.log('Processing complete.'))
    .catch(err => console.error('Error processing workflows:', err));
