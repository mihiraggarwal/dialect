let enabled = true; 
let difficulty = 1; 
let frequency = 50; 
let language = "es";
let user_id="";
const API_URL = "http://localhost:5000";
chrome.storage.sync.get("user_id", function(data) {
    user_id = data.user_id;
    console.log(user_id);
});

const languagePair = {
    "sourceLanguage": "en",
    "targetLanguage": language
}

let translator = null;
let filteredOnce = false;


async function initTranslator() {
    try {
        const canTranslate = await translation.canTranslate(languagePair);
        if (canTranslate !== "no") {
            if (canTranslate === "readily") {
                translator = await translation.createTranslator(languagePair);
            } else {
                translator = await translation.createTranslator(languagePair);
                translator.addEventListener('downloadprogress', (e) => {
                    console.log(e.loaded, e.total);
                });
                await translator.ready;      
            }
        } else {
            chrome.storage.local.set({ onDevice: false });
        }
    } catch (error) {
        console.error("Translator initialization error:", error);
        chrome.storage.local.set({ onDevice: false });
    }
}

let session = null;
async function initLLM() {
    const {available, defaultTemperature, defaultTopK, maxTopK } = await ai.languageModel.capabilities();
    if (available !== "no") {
        console.log("Model is ready")
        session = await ai.languageModel.create();
        console.log("Model is created")

    }
}


const loadSettings = async () => {
    return new Promise((resolve) => {
        chrome.storage.sync.get(["enabled", "difficulty", "frequency", "language"], (result) => {
            enabled = result.enabled !== undefined ? result.enabled : true;
            difficulty = result.difficulty !== undefined ? result.difficulty : 1;
            frequency = result.frequency !== undefined ? result.frequency : 50;
            frequency = 50;
            language = result.language || "es";
            resolve();
        });
    });
};

const escapeRegex = (string) => {
    return string.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
};

async function replaceText() {
    await initTranslator();
    await initLLM();
    await loadSettings();

    if (!enabled) return;

    const elements = document.body.querySelectorAll(":not(script):not(style)");

    let allSentences = [];
    let allWords = [];
    let filteredItems = [];
    let translatedItems = [];
    let wordContexts = [];

    for (const element of elements) {
        for (const node of element.childNodes) {
            if (node.nodeType === Node.TEXT_NODE) {
                const originalText = node.textContent.trim();
                if (originalText) {
                    const sentences = originalText.match(/[^.!?]+[.!?]+/g) || [];
                    allSentences = allSentences.concat(sentences);
                }
            }
        }
    }

    if (difficulty === 2) {
        filteredItems = selectRandomItems(allSentences, frequency);
        console.log("Filtered Sentences:", filteredItems);
    } else if (difficulty === 0) {
        allSentences.forEach(sentence => {
            allWords = allWords.concat(sentence.split(/\s+/));
        });
        filteredItems = selectRandomItems(allWords, frequency);
        console.log("Filtered Words:", filteredItems);
    } else if (difficulty === 1) {
        let phrases = findPhrases(allSentences);
        filteredItems = selectRandomItems(phrases, frequency);
        console.log("Filtered Phrases:", filteredItems);
    }

    if (translator) {
        for (const item of filteredItems) {
            const translatedItem = await translateText(item);
            console.log("Translated:", item, "=>", translatedItem);

            const originalSentence = allSentences.find(sentence => sentence.includes(item));
            
            const words = item.split(/\s+/);
            words.forEach(word => {
                wordContexts.push({
                    original: word.toLowerCase(),
                    context: originalSentence
                });
            });

            translatedItems.push({ 
                original: item, 
                translated: translatedItem,
                words: words
            });
        }

        console.log("Word Contexts:", wordContexts);

        // Replace elements
        for (const element of elements) {
            for (const node of element.childNodes) {
                if (node.nodeType === Node.TEXT_NODE) {
                    let textContent = node.textContent;
                    let parentElement = node.parentNode;
                    const newNodes = [];
                    let lastIndex = 0;
                    for (const { original, translated } of translatedItems) {
                        const regex = new RegExp(`\\b${escapeRegex(original)}\\b`, "gi");
                        let match;

                        while ((match = regex.exec(textContent)) !== null) {
                            const beforeMatch = textContent.slice(lastIndex, match.index);
                            const matchedText = match[0];
                            const afterMatch = textContent.slice(regex.lastIndex);

                            if (beforeMatch) {
                                newNodes.push(document.createTextNode(beforeMatch));
                            }
                            const span = document.createElement("span");
                            span.textContent = translated;
                            span.style.textDecoration = "underline";
                            span.style.textDecorationColor = "#8ac90c";
                            span.style.cursor = "pointer";
                            span.style.position = "relative";
                            span.addEventListener("mouseenter", (e) => {
                                createTooltip(e, matchedText);
                            });
                            span.addEventListener("mouseleave", removeTooltip);

                            newNodes.push(span);
                            lastIndex = regex.lastIndex;
                            textContent = afterMatch;
                        }
                    }
                    if (textContent) {
                        newNodes.push(document.createTextNode(textContent));
                    }
                    if (newNodes.length > 0) {
                        parentElement.replaceChild(newNodes.length === 1 ? newNodes[0] : createFragment(newNodes), node);
                    }
                }
            }
        }
    }

    async function processAndFetch() {
        const translationPromises = wordContexts.map(async (wordContext) => {
            try {
                if (!isNaN(wordContext.original)) return null;
                const word = wordContext.original;
                const tr = await translateText(word);
                wordContext.translated = tr;
                return wordContext; 
            } catch (error) {
                console.warn(`Translation failed for word: ${wordContext.original}`, error);
                return null; 
            }
        });
    
        
        const results = await Promise.all(translationPromises);
    
        const filteredWordContexts = results.filter(context => context !== null);
    
    
        fetch(`${API_URL}/graph`, {
            method: "POST",
            headers: {
                "Content-Type": "application/json",
                "Authorization": `${user_id}`
            },
            body: JSON.stringify({
                "wordList": filteredWordContexts,
                "lang": language
            })
        });
    }
    
    processAndFetch();
    
    


    // Ignore everything below this
    // Send data to LLM now
    // All of this must happen in the backend
    // Clusters have to be leaf nodes
    const clusters = ["Animals", "Plants","Technology"].join(", ");

    var prompt =`
    I am creating a knowledge graph that clusters similar words together based on their meaning.
    Here are the clusters I current have: ${clusters}. 
    I save words as {"word": "Dog", "cluster": "Animals"}.

    Please provide clusters for the following words.
    If the cluster does not exist in the list, follow the instruction provided below.Make sure this cluster is the most specific category for the word.
    Do not provide examples.
    Instructions for if cluster does not exist: Instead of giving a cluster name, follow the below schema to create a new specific cluster, along with all the parent clusters.
    Make sure to encapsulate the new cluster schema with <NEW_CLUSTER> and </NEW_CLUSTER> tags.
    Schema:
    {
                    id: 'animals',
                    label: 'Animals',
                    color: '#2c3e50',
                    subclusters: [
                        {
                            id: 'mammals',
                            label: 'Mammals',
                            color: '#3498db',
                            subclusters: [
                                {
                                    id: 'dogs',
                                    label: 'Dogs',
                                    color: '#5dade2',
                                    words: [
                                        { id: 'dog', label: 'Dog' },
                                        { id: 'puppy', label: 'Puppy' },
                                        { id: 'bark', label: 'Bark' },
                                        { id: 'leash', label: 'Leash' }
                                    ]
                                },
                                {
                                    id: 'cats',
                                    label: 'Cats',
                                    color: '#5dade2',
                                    words: [
                                        { id: 'cat', label: 'Cat' },
                                        { id: 'kitten', label: 'Kitten' },
                                        { id: 'meow', label: 'Meow' },
                                        { id: 'purr', label: 'Purr' }
                                    ]
                                }
                            ]
                        }
                    ]
                }
    The words:

    `

    let prompts = [];
    var c = 0;
    var buffer_size = 1;
    var buff = prompt;
    let words = []
    // Filter these by words that don't exist in the DB
    // for (let i = 0; i < wordContexts.length; i++) {
    //     var word = wordContexts[i].word;
    //     words.push(word);
    //     console.log(word);
    //     var context = wordContexts[i].context;

    //     //buff += "Word: " + word + ", in the context of: " + context + "\n";
    //     buff += "Word:" + word + "\n";
    //     c +=1;

    //     if (c === buffer_size) {
    //         prompts.push(buff);
    //         c = 0;
    //         buff = prompt;
    //     }

    // }

    // console.log(prompts);
    // var results = [];
    // var size = prompts.length;
    // if (session === null) {
    //     console.log("Session not found for LLM");
    //     return;
    // }
    // for (let i = 0; i < size; i++) {
    //     console.log(`Generating response ${i} / ${size}`);
    //     const r = await session.prompt(prompts[i]);
    //     console.log(r)
    //     results.push(r);
    // }
    // console.log(results)

    // Results will either have leaf cluster names, or new clusters created. Traverse all existing clusters
    // If a parent cluster already exists and this leaf is not a child of that parent, add it as a child
    // If a parent cluster doesnt exist, add it.
    // If a new cluster is created, add it to the root
    // Essentially- merge the two trees together
    // Might get some duplicates but this is efficient enough

}
function createFragment(nodes) {
    const fragment = document.createDocumentFragment();
    nodes.forEach(node => fragment.appendChild(node));
    return fragment;
}


const createTooltip = (event, originalText) => {
    removeTooltip();
    
    const tooltip = document.createElement("div");
    tooltip.textContent = originalText;
    tooltip.classList.add("translation-tooltip");
    
    const span = event.currentTarget;
    span.appendChild(tooltip);
    const spanRect = span.getBoundingClientRect();
    tooltip.style.position = "absolute";
    tooltip.style.left = "0%";
    tooltip.style.top = "-60px";
    //tooltip.style.transform = "translateX(-50%)";
    tooltip.style.width = "100%";
    tooltip.style.minWidth = "100px";
    // Keep within viewport
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    if (tooltipRect.left < 0) {
        tooltip.style.left = "0";
        tooltip.style.transform = "translateX(0)";
    } else if (tooltipRect.right > viewportWidth) {
        tooltip.style.left = "auto";
        tooltip.style.right = "0";
        tooltip.style.transform = "translateX(0)";
    }
    
    // Fliop if near bottom
    if (tooltipRect.top < 0) {
        tooltip.style.top = "100%";
        tooltip.style.marginTop = "10px";
        tooltip.classList.add("tooltip-bottom");
    }

    window.requestAnimationFrame(() => {
        tooltip.style.opacity = "1";
    });
};


const removeTooltip = () => {
    const tooltip = document.querySelector(".translation-tooltip");
    if (tooltip) {
        tooltip.remove();
    }
};

// Styles for tooltips
const style = document.createElement("style");
style.textContent = `
    .translation-tooltip {
    background-color: white;
    color: black;
    border: none;
    border-radius: 8px;
    padding: 16px 12px;
    box-shadow: 0 4px 12px rgba(0, 0, 0, 0.15), 
                0 0 1px rgba(0, 0, 0, 0.1);
    z-index: 1000;
    pointer-events: none;
    font-size: 13px;
    font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Helvetica, Arial, sans-serif;
    font-weight: 400;
    letter-spacing: 0.3px;
    backdrop-filter: blur(8px);
    transform: translateY(0);
    opacity: 0;
    animation: tooltipFade 0.2s ease forwards;
}

@keyframes tooltipFade {
    from {
        opacity: 0;
        transform: translateY(4px);
    }
    to {
        opacity: 1;
        transform: translateY(0);
    }
}

/* Optional: Add a subtle arrow */
.translation-tooltip::after {
    content: '';
    position: absolute;
    bottom: -4px;
    left: 50%;
    margin-left: -4px;
    border-width: 4px 4px 0;
    border-style: solid;
    border-color: rgba(33, 33, 33, 0.95) transparent transparent transparent;
}
`;
document.head.appendChild(style);

const selectRandomItems = (array, percentage) => {
    var count = Math.floor((percentage / 100) * array.length);
    count = 10;
    const shuffled = array.sort(() => 0.5 - Math.random());
    return shuffled.slice(0, count);
};

const findPhrases = (sentences) => {
    const nGramSizeMin = 3; 
    const nGramSizeMax = 5; 
    const allPhrases = []; 
    
    const generateNGrams = (words, n) => {
        const nGrams = [];
        for (let i = 0; i <= words.length - n; i++) {
            const nGram = words.slice(i, i + n).join(" ");
            nGrams.push(nGram);
        }
        return nGrams;
    };

    for (const sentence of sentences) {
        const words = sentence
            .toLowerCase()
            .replace(/[^\w\s]/g, "")
            .split(/\s+/); 

        for (let n = nGramSizeMin; n <= nGramSizeMax; n++) {
            const nGrams = generateNGrams(words, n);
            allPhrases.push(...nGrams); 
        }
    }

    return allPhrases;
};

const translateText = async (text) => {
    if (translator) {
        const translation = await translator.translate(text);
        return translation;
    }
    return text;
};

replaceText().catch(console.error);