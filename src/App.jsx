import { useState, useRef, useCallback, useEffect } from "react";

const STYLES = `
  @import url('https://fonts.googleapis.com/css2?family=Playfair+Display:ital,wght@0,400;0,600;1,400;1,600&family=DM+Sans:wght@300;400;500&display=swap');

  * { box-sizing: border-box; margin: 0; padding: 0; }

  :root {
    --bg: #0d1a14;
    --surface: #132019;
    --surface2: #1a2d1f;
    --border: #1f3325;
    --border2: #2a4330;
    --accent: #c9a96e;
    --accent2: #a8854a;
    --text: #f0e6c8;
    --text2: #8aaa8f;
    --text3: #3d5c44;
    --green: #7dba8a;
    --red: #c46b6b;
  }

  body {
    background: var(--bg);
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    min-height: 100vh;
    overflow-x: hidden;
  }

  .grain {
    position: fixed;
    inset: 0;
    pointer-events: none;
    z-index: 100;
    opacity: 0.035;
    background-image: url("data:image/svg+xml,%3Csvg viewBox='0 0 256 256' xmlns='http://www.w3.org/2000/svg'%3E%3Cfilter id='noise'%3E%3CfeTurbulence type='fractalNoise' baseFrequency='0.9' numOctaves='4' stitchTiles='stitch'/%3E%3C/filter%3E%3Crect width='100%25' height='100%25' filter='url(%23noise)'/%3E%3C/svg%3E");
    background-size: 200px;
  }

  .app {
    max-width: 640px;
    margin: 0 auto;
    padding: 48px 24px 80px;
    animation: fadeUp 0.6s ease both;
  }

  @keyframes fadeUp {
    from { opacity: 0; transform: translateY(20px); }
    to { opacity: 1; transform: translateY(0); }
  }

  .header {
    text-align: center;
    margin-bottom: 48px;
  }

  .logo {
    font-family: 'DM Sans', sans-serif;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.25em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 20px;
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 10px;
  }

  .logo::before, .logo::after {
    content: '';
    width: 32px;
    height: 1px;
    background: var(--border2);
  }

  .title {
    font-family: 'Playfair Display', serif;
    font-size: 22px;
    font-weight: 400;
    line-height: 1.45;
    color: var(--text);
    margin-bottom: 12px;
    letter-spacing: -0.01em;
  }

  .title em {
    font-style: italic;
    color: var(--accent);
    letter-spacing: -0.01em;
  }

  .subtitle {
    font-size: 15px;
    color: var(--text2);
    font-weight: 300;
    line-height: 1.6;
  }

  .counter {
    display: inline-flex;
    align-items: center;
    gap: 6px;
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 20px;
    padding: 6px 14px;
    font-size: 13px;
    color: var(--text2);
    margin-top: 16px;
  }

  .counter-dot {
    width: 6px;
    height: 6px;
    border-radius: 50%;
    background: var(--green);
    animation: pulse 2s ease infinite;
  }

  @keyframes pulse {
    0%, 100% { opacity: 1; }
    50% { opacity: 0.4; }
  }

  .section {
    background: var(--surface);
    border: 1px solid var(--border);
    border-radius: 16px;
    overflow: hidden;
    margin-bottom: 16px;
  }

  .section-header {
    padding: 16px 20px;
    border-bottom: 1px solid var(--border);
    display: flex;
    align-items: center;
    gap: 10px;
    font-size: 13px;
    color: var(--text2);
    font-weight: 500;
    letter-spacing: 0.05em;
    text-transform: uppercase;
  }

  .section-icon {
    font-size: 16px;
  }

  .drop-zone {
    padding: 32px 20px;
    display: flex;
    flex-direction: column;
    align-items: center;
    gap: 12px;
    cursor: pointer;
    transition: background 0.2s;
    border: 2px dashed transparent;
    position: relative;
  }

  .drop-zone:hover, .drop-zone.dragging {
    background: var(--surface2);
    border-color: var(--border2);
    border-radius: 0;
  }

  .drop-icon {
    width: 48px;
    height: 48px;
    border-radius: 12px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    display: flex;
    align-items: center;
    justify-content: center;
    font-size: 22px;
  }

  .drop-text {
    font-size: 15px;
    color: var(--text);
    font-weight: 400;
  }

  .drop-hint {
    font-size: 13px;
    color: var(--text3);
  }

  .drop-btn {
    background: var(--surface2);
    border: 1px solid var(--border2);
    color: var(--accent);
    padding: 8px 20px;
    border-radius: 8px;
    font-size: 13px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    font-weight: 500;
    transition: all 0.15s;
  }

  .drop-btn:hover {
    background: var(--border2);
    border-color: var(--accent);
  }

  .previews {
    display: grid;
    grid-template-columns: repeat(3, 1fr);
    gap: 8px;
    padding: 0 20px 20px;
  }

  .preview-item {
    position: relative;
    border-radius: 8px;
    overflow: hidden;
    aspect-ratio: 9/16;
    background: var(--surface2);
    border: 1px solid var(--border);
  }

  .preview-item img {
    width: 100%;
    height: 100%;
    object-fit: cover;
  }

  .preview-remove {
    position: absolute;
    top: 4px;
    right: 4px;
    width: 22px;
    height: 22px;
    border-radius: 50%;
    background: rgba(0,0,0,0.7);
    border: none;
    color: #fff;
    font-size: 14px;
    cursor: pointer;
    display: flex;
    align-items: center;
    justify-content: center;
    line-height: 1;
  }

  .context-area {
    padding: 0 20px 20px;
  }

  .context-input {
    width: 100%;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 10px;
    padding: 14px 16px;
    color: var(--text);
    font-family: 'DM Sans', sans-serif;
    font-size: 14px;
    font-weight: 300;
    resize: none;
    min-height: 90px;
    outline: none;
    transition: border-color 0.15s;
    line-height: 1.6;
  }

  .context-input::placeholder { color: var(--text3); }
  .context-input:focus { border-color: var(--border2); }

  .context-hint {
    font-size: 12px;
    color: var(--text3);
    margin-top: 8px;
  }

  .submit-btn {
    width: 100%;
    padding: 18px;
    background: var(--accent2);
    border: none;
    border-radius: 14px;
    color: #fff;
    font-family: 'DM Sans', sans-serif;
    font-size: 16px;
    font-weight: 500;
    font-style: normal;
    cursor: pointer;
    transition: all 0.2s;
    margin-bottom: 16px;
    position: relative;
    overflow: hidden;
  }

  .submit-btn:hover:not(:disabled) {
    background: #d4804f;
    transform: translateY(-1px);
    box-shadow: 0 8px 24px rgba(196, 113, 74, 0.3);
  }

  .submit-btn:active:not(:disabled) { transform: translateY(0); }

  .submit-btn:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }

  .loading-state {
    text-align: center;
    padding: 48px 20px;
  }

  .loading-dots {
    display: flex;
    gap: 8px;
    justify-content: center;
    margin-bottom: 16px;
  }

  .loading-dots span {
    width: 8px;
    height: 8px;
    border-radius: 50%;
    background: var(--accent);
    animation: bounce 1.2s ease infinite;
  }

  .loading-dots span:nth-child(2) { animation-delay: 0.2s; }
  .loading-dots span:nth-child(3) { animation-delay: 0.4s; }

  @keyframes bounce {
    0%, 80%, 100% { transform: scale(0.6); opacity: 0.4; }
    40% { transform: scale(1); opacity: 1; }
  }

  .loading-text {
    font-family: 'Playfair Display', serif;
    font-size: 16px;
    font-style: italic;
    font-weight: 300;
    color: var(--text2);
  }

  .results-section {
    animation: fadeUp 0.5s ease both;
  }

  .results-header {
    padding: 20px 20px 0;
    margin-bottom: 16px;
  }

  .results-title {
    font-family: 'Playfair Display', serif;
    font-size: 20px;
    font-weight: 400;
    color: var(--text);
    margin-bottom: 4px;
  }

  .results-subtitle {
    font-size: 13px;
    color: var(--text2);
  }

  .variant-card {
    margin: 0 16px 12px;
    background: var(--surface2);
    border: 1px solid var(--border2);
    border-radius: 12px;
    overflow: hidden;
    transition: border-color 0.2s;
  }

  .variant-card:hover {
    border-color: var(--accent2);
  }

  .variant-header {
    padding: 12px 16px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    border-bottom: 1px solid var(--border);
  }

  .variant-label {
    display: flex;
    align-items: center;
    gap: 8px;
    font-size: 12px;
    font-weight: 500;
    letter-spacing: 0.08em;
    text-transform: uppercase;
  }

  .variant-dot {
    width: 8px;
    height: 8px;
    border-radius: 50%;
  }

  .dot-soft { background: #7dba8a; }
  .dot-mid { background: #e8c47c; }
  .dot-direct { background: #e87c7c; }

  .label-soft { color: #7dba8a; }
  .label-mid { color: #e8c47c; }
  .label-direct { color: #e87c7c; }

  .copy-btn {
    background: transparent;
    border: 1px solid var(--border2);
    color: var(--text2);
    padding: 5px 12px;
    border-radius: 6px;
    font-size: 12px;
    cursor: pointer;
    font-family: 'DM Sans', sans-serif;
    transition: all 0.15s;
    display: flex;
    align-items: center;
    gap: 5px;
  }

  .copy-btn:hover {
    border-color: var(--accent);
    color: var(--accent);
  }

  .copy-btn.copied {
    border-color: var(--green);
    color: var(--green);
  }

  .variant-body {
    padding: 16px;
    font-size: 15px;
    color: var(--text);
    line-height: 1.7;
    font-weight: 300;
    white-space: pre-wrap;
  }

  .analysis-block {
    margin: 0 16px 16px;
    padding: 14px 16px;
    background: rgba(232, 168, 124, 0.05);
    border: 1px solid rgba(232, 168, 124, 0.15);
    border-radius: 10px;
  }

  .analysis-title {
    font-size: 11px;
    letter-spacing: 0.1em;
    text-transform: uppercase;
    color: var(--accent);
    margin-bottom: 8px;
    font-weight: 500;
  }

  .analysis-text {
    font-size: 13px;
    color: var(--text2);
    line-height: 1.6;
    font-weight: 300;
  }

  .reset-btn {
    display: block;
    margin: 0 16px 20px;
    padding: 12px;
    width: calc(100% - 32px);
    background: transparent;
    border: 1px solid var(--border2);
    border-radius: 10px;
    color: var(--text3);
    font-family: 'DM Sans', sans-serif;
    font-size: 13px;
    cursor: pointer;
    transition: all 0.15s;
  }

  .reset-btn:hover {
    border-color: var(--border2);
    color: var(--text2);
    background: var(--surface2);
  }

  .error-block {
    margin: 16px;
    padding: 14px 16px;
    background: rgba(196, 107, 107, 0.08);
    border: 1px solid rgba(196, 107, 107, 0.25);
    border-radius: 10px;
    font-size: 14px;
    color: #e89090;
    line-height: 1.5;
  }

  .disclaimer {
    text-align: center;
    font-size: 12px;
    color: var(--text3);
    margin-top: 32px;
    line-height: 1.6;
  }

  .file-error {
    background: rgba(196,107,107,.08);
    border: 1px solid rgba(196,107,107,.2);
    border-radius: 8px;
    padding: 10px 14px;
    font-size: 13px;
    color: #e89090;
    margin: 0 0 12px;
  }

  .cookie-banner {
    position: fixed;
    bottom: 0;
    left: 0;
    right: 0;
    background: var(--surface);
    border-top: 1px solid var(--border2);
    padding: 16px 24px;
    display: flex;
    align-items: center;
    justify-content: space-between;
    gap: 16px;
    z-index: 200;
    animation: slideUp .4s ease both;
  }

  @keyframes slideUp {
    from { transform: translateY(100%); }
    to { transform: translateY(0); }
  }

  .cookie-text {
    font-size: 13px;
    color: var(--text2);
    font-weight: 300;
    line-height: 1.5;
    flex: 1;
  }

  .cookie-text a {
    color: var(--accent);
    text-decoration: none;
  }

  .cookie-btn {
    background: var(--accent2);
    border: none;
    color: #fff;
    padding: 9px 20px;
    border-radius: 8px;
    font-size: 13px;
    font-weight: 500;
    font-family: 'DM Sans', sans-serif;
    cursor: pointer;
    white-space: nowrap;
    transition: background .15s;
    flex-shrink: 0;
  }

  .cookie-btn:hover { background: #c9a05a; }
`;

const SYSTEM_PROMPT = `Твоя задача — внимательно прочитать переписку и помочь парню написать ответ, который звучит как живой человек, а не как шаблон из интернета.

Сначала напиши короткий анализ (2-3 предложения): что именно она говорит, какие конкретные слова или фразы из её сообщений показывают суть боли. Не обобщай — цепляйся за детали переписки.

Затем дай три варианта ответа. Каждый вариант должен звучать иначе по тону, но все три должны отвечать именно на эту конкретную переписку — использовать её слова, её образы, реагировать на то что она написала, а не на абстрактный конфликт.

Отвечай ТОЛЬКО в формате JSON (без markdown-блоков, без пояснений вне JSON):
{
  "analysis": "что именно происходит в этой конкретной переписке — детали, не общие слова",
  "variants": [
    {
      "tone": "тёплый",
      "label": "Тёплый",
      "text": "текст ответа"
    },
    {
      "tone": "прямой",
      "label": "Прямой",
      "text": "текст ответа"
    },
    {
      "tone": "честный",
      "label": "Честный",
      "text": "текст ответа"
    }
  ]
}

Жёсткие правила для текстов ответов:

Язык и тон:
- Пиши как реальный мужчина пишет сообщение, не как копирайтер и не как психолог
- Никакого канцелярита, никаких слов "осознаю", "ценю", "важно для меня", "хочу донести", "на данном этапе", "в сложившейся ситуации"
- Никаких конструкций "я понимаю, что ты чувствуешь", "я слышу тебя", "я вижу тебя" — это скрипт колл-центра
- Никаких "твои чувства валидны", "ты имеешь право так чувствовать" — терапевтический язык в переписке звучит фальшиво
- Никаких театральных извинений: "прости меня пожалуйста", "мне очень жаль" в начале сообщения
- Никаких пустых обещаний: "я изменюсь", "такого больше не повторится", "обещаю что", "клянусь что", "я стану лучше"
- Никаких затёртых финалов: "ты для меня важна", "ты много значишь для меня", "я дорожу тобой", "я не хочу тебя потерять" — эти фразы обесценились
- Никаких вводных копирайтерских приёмов в начале: "послушай,", "смотри,", "скажу честно," — звучит как скрипт продажника
- Никаких советов идти поговорить вживую или созвониться — остаёмся в переписке
- Не заканчивать вопросом — вопрос в конце звучит как манипуляция

Структура и длина:
- Каждый вариант 3-6 предложений — достаточно чтобы быть весомым, достаточно коротко чтобы дочитали
- Мысли внутри варианта должны развиваться, а не перечисляться
- Никаких списков, никаких абзацев разбитых для эффекта — один цельный текст

Содержание:
- Тёплый вариант: признаёт её конкретные слова и чувства, без оправданий, даёт ей почувствовать что её услышали
- Прямой вариант: берёт ответственность за конкретное что пошло не так, говорит что будет по-другому — без обещаний которые нельзя проверить
- Честный вариант: называет ситуацию своими словами без прикрас, показывает что он понял суть, без лишних слов и без попытки смягчить

Строго запрещённые паттерны — их не должно быть ни в одном из трёх вариантов:
- Конструкции «это не X, это Y» и любые варианты контраста через отрицание («не про X, а про Y», «не в словах, а в поступках», «не потому что X, а просто Y»)
- «Дело не в том», «разница не в этом», «речь не об этом» — тезисы через отрицание
- Короткие предложения из одного-двух слов расставленные для драматического эффекта
- Дробление одной мысли на три коротких предложения подряд ради ритма
- «Именно поэтому / именно сейчас / именно это» — искусственное усиление
- «Это не случайность» и любая псевдомногозначительность
- Риторические вопросы в конце — особенно «ты понимаешь?», «ты слышишь меня?»
- «Звучит просто. На самом деле…» — ложная глубина
- Перечисление через «во-первых / во-вторых / в-третьих»
- Финальные фразы с двойным тире для создания эффекта
- «Я всё осознал», «я переосмыслил», «я понял насколько», «я беру на себя ответственность» — звучит как речь на собрании
- «Это про нас обоих», «это про доверие», «это про любовь», «двигаться вперёд», «работать над отношениями» — абстракции вместо живых слов
- «Позволь объяснить», «дай мне объяснить», «хочу быть честным с тобой» — вводные конструкции которые сигнализируют что дальше будет оправдание
- Любое предложение которое можно найти в статье «10 фраз чтобы помириться с девушкой»

Главный тест: перечитай каждый вариант и спроси себя — мог ли это написать живой мужик в 23:00 со своего телефона. Если нет — перепиши.`;

const ALLOWED_TYPES = ["image/jpeg", "image/png", "image/webp", "image/gif"];
const MAX_FILE_SIZE_MB = 10;

export default function Peacemaker() {
  const [images, setImages] = useState([]);
  const [context, setContext] = useState("");
  const [loading, setLoading] = useState(false);
  const [result, setResult] = useState(null);
  const [error, setError] = useState(null);
  const [fileErrors, setFileErrors] = useState([]);
  const [dragging, setDragging] = useState(false);
  const [copied, setCopied] = useState(null);
  const [freeLeft, setFreeLeft] = useState(3);
  const [cookieAccepted, setCookieAccepted] = useState(true);
  const fileInputRef = useRef();

  useEffect(() => {
    const accepted = localStorage.getItem("cookie_accepted");
    if (!accepted) setCookieAccepted(false);
  }, []);

  const acceptCookies = () => {
    localStorage.setItem("cookie_accepted", "1");
    setCookieAccepted(true);
  };

  const toBase64 = (file) => new Promise((res, rej) => {
    const r = new FileReader();
    r.onload = () => res(r.result.split(",")[1]);
    r.onerror = rej;
    r.readAsDataURL(file);
  });

  const addFiles = useCallback(async (files) => {
    const errors = [];
    const validFiles = Array.from(files).filter(f => {
      if (!ALLOWED_TYPES.includes(f.type)) {
        errors.push(`${f.name}: неподдерживаемый формат. Нужен JPG, PNG или WebP.`);
        return false;
      }
      if (f.size > MAX_FILE_SIZE_MB * 1024 * 1024) {
        errors.push(`${f.name}: файл больше ${MAX_FILE_SIZE_MB} МБ.`);
        return false;
      }
      return true;
    }).slice(0, 6 - images.length);

    setFileErrors(errors);
    if (validFiles.length === 0) return;

    const newImgs = await Promise.all(validFiles.map(async (f) => ({
      file: f,
      url: URL.createObjectURL(f),
      base64: await toBase64(f),
      type: f.type,
    })));
    setImages(prev => [...prev, ...newImgs].slice(0, 6));
  }, [images.length]);

  const handleDrop = useCallback((e) => {
    e.preventDefault();
    setDragging(false);
    addFiles(e.dataTransfer.files);
  }, [addFiles]);

  const handleRemove = (idx) => {
    setImages(prev => prev.filter((_, i) => i !== idx));
  };

  const handleSubmit = async () => {
    if (images.length === 0 && !context.trim()) return;
    setLoading(true);
    setError(null);
    setResult(null);

    try {
      const content = [];

      images.forEach((img) => {
        content.push({
          type: "image",
          source: { type: "base64", media_type: img.type, data: img.base64 }
        });
      });

      const contextText = context.trim()
        ? `Скриншоты переписки выше. Дополнительный контекст от парня: ${context.trim()}`
        : images.length > 0
        ? "Проанализируй скриншоты переписки и помоги составить примирительный ответ."
        : `Контекст ситуации: ${context.trim()}. Помоги составить примирительный ответ.`;

      content.push({ type: "text", text: contextText });

      const response = await fetch("https://api.anthropic.com/v1/messages", {
  method: "POST",
  headers: {
    "Content-Type": "application/json",
    "x-api-key": import.meta.env.VITE_ANTHROPIC_KEY,
    "anthropic-version": "2023-06-01",
    "anthropic-dangerous-direct-browser-access": "true"
  },body: JSON.stringify({
  model: "claude-sonnet-4-20250514",
  max_tokens: 1000,
  system: SYSTEM_PROMPT,
  messages: [{ role: "user", content }],
}),
      });

      const data = await response.json();
      if (data.error) throw new Error(data.error.message);

      const raw = data.content.map(i => i.text || "").join("");
      const clean = raw.replace(/```json|```/g, "").trim();
      const parsed = JSON.parse(clean);

      setResult(parsed);
      setFreeLeft(prev => Math.max(0, prev - 1));
    } catch (err) {
      console.error(err);
      const msg = err.message || "";
      if (msg.includes("529") || msg.includes("overloaded")) {
        setError("Сервис временно перегружен. Подожди минуту и попробуй снова.");
      } else if (msg.includes("400")) {
        setError("Не удалось прочитать скриншот. Попробуй другой формат или опиши ситуацию текстом.");
      } else if (msg.includes("Failed to fetch") || msg.includes("network")) {
        setError("Нет соединения. Проверь интернет и попробуй снова.");
      } else if (msg.includes("JSON")) {
        setError("Получили неожиданный ответ. Попробуй ещё раз — обычно помогает.");
      } else {
        setError("Что-то пошло не так. Попробуй ещё раз или опиши ситуацию текстом без скриншота.");
      }
    } finally {
      setLoading(false);
    }
  };

  const copyText = async (text, idx) => {
    await navigator.clipboard.writeText(text);
    setCopied(idx);
    setTimeout(() => setCopied(null), 2000);
  };

  const toneStyles = [
    { dotClass: "dot-soft", labelClass: "label-soft" },
    { dotClass: "dot-mid", labelClass: "label-mid" },
    { dotClass: "dot-direct", labelClass: "label-direct" },
  ];

  return (
    <>
      <style>{STYLES}</style>
      <div className="grain" />
      <div className="app">
        <div className="header">
          <div className="logo">Что ей ответить?</div>
          <h1 className="title">Скинь скрин переписки —<br />я напишу <em>ответ</em>,<br />который поможет помириться</h1>
          <div className="counter">
            <span className="counter-dot" />
            Осталось бесплатных запросов: {freeLeft}
          </div>
        </div>

        {!result && !loading && (
          <>
            <div className="section">
              <div className="section-header">
                <span className="section-icon">🖼</span>
                Скриншоты переписки
              </div>

              <div
                className={`drop-zone ${dragging ? "dragging" : ""}`}
                onDragOver={(e) => { e.preventDefault(); setDragging(true); }}
                onDragLeave={() => setDragging(false)}
                onDrop={handleDrop}
                onClick={() => fileInputRef.current?.click()}
              >
                <div className="drop-icon">📱</div>
                <div className="drop-text">Перетащи скрины сюда</div>
                <div className="drop-hint">или нажми чтобы выбрать · до 6 файлов</div>
                <button className="drop-btn" onClick={(e) => { e.stopPropagation(); fileInputRef.current?.click(); }}>
                  Выбрать файлы
                </button>
              </div>

              {images.length > 0 && (
                <div className="previews">
                  {images.map((img, i) => (
                    <div key={i} className="preview-item">
                      <img src={img.url} alt="" />
                      <button className="preview-remove" onClick={() => handleRemove(i)}>×</button>
                    </div>
                  ))}
                </div>
              )}

              <input
                ref={fileInputRef}
                type="file"
                accept="image/*"
                multiple
                style={{ display: "none" }}
                onChange={(e) => addFiles(e.target.files)}
              />
            </div>

            <div className="section">
              <div className="section-header">
                <span className="section-icon">✏️</span>
                Контекст (необязательно)
              </div>
              <div className="context-area">
                <textarea
                  className="context-input"
                  placeholder="Что произошло? Как давно вместе? Что ты уже говорил? Чем накосячил?&#10;&#10;Чем больше расскажешь — тем точнее будет ответ."
                  value={context}
                  onChange={(e) => setContext(e.target.value)}
                  rows={4}
                />
                <div className="context-hint">Можно использовать без скриншотов — просто опиши ситуацию текстом</div>
              </div>
            </div>

            {fileErrors.length > 0 && (
              <div style={{margin: "0 0 12px"}}>
                {fileErrors.map((e, i) => (
                  <div key={i} className="file-error">{e}</div>
                ))}
              </div>
            )}

            <button
              className="submit-btn"
              onClick={handleSubmit}
              disabled={images.length === 0 && !context.trim()}
            >
              Помоги написать ответ →
            </button>
          </>
        )}

        {loading && (
          <div className="section">
            <div className="loading-state">
              <div className="loading-dots">
                <span /><span /><span />
              </div>
              <div className="loading-text">Читаю переписку, думаю что написать…</div>
            </div>
          </div>
        )}

        {error && (
          <div className="section">
            <div className="error-block">{error}</div>
            <button className="reset-btn" onClick={() => setError(null)}>← Попробовать снова</button>
          </div>
        )}

        {result && (
          <div className="section results-section">
            <div className="results-header">
              <div className="results-title">Варианты ответа</div>
              <div className="results-subtitle">Выбери тон — скопируй текст</div>
            </div>

            {result.analysis && (
              <div className="analysis-block">
                <div className="analysis-title">Что происходит</div>
                <div className="analysis-text">{result.analysis}</div>
              </div>
            )}

            {result.variants?.map((v, i) => (
              <div key={i} className="variant-card">
                <div className="variant-header">
                  <div className="variant-label">
                    <span className={`variant-dot ${toneStyles[i]?.dotClass}`} />
                    <span className={toneStyles[i]?.labelClass}>{v.label}</span>
                  </div>
                  <button
                    className={`copy-btn ${copied === i ? "copied" : ""}`}
                    onClick={() => copyText(v.text, i)}
                  >
                    {copied === i ? "✓ Скопировано" : "Скопировать"}
                  </button>
                </div>
                <div className="variant-body">{v.text}</div>
              </div>
            ))}

            <button className="reset-btn" onClick={() => { setResult(null); setImages([]); setContext(""); }}>
              ← Новая ситуация
            </button>
          </div>
        )}

        <div className="disclaimer">
          Сервис помогает найти слова — не решает проблему.<br />
          Честный разговор всегда лучше идеального текста.
        </div>
      </div>

      {!cookieAccepted && (
        <div className="cookie-banner">
          <div className="cookie-text">
            Мы используем cookies для работы сервиса и обработки платежей через Paddle.{" "}
            <a href="/privacy" target="_blank">Политика конфиденциальности</a>
          </div>
          <button className="cookie-btn" onClick={acceptCookies}>Понятно</button>
        </div>
      )}
    </>
  );
}