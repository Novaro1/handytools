#!/usr/bin/env python3
"""Build script: split index.html into shared styles.css + app.js and generate
per-tool SEO landing pages plus a rebuilt hub. Idempotent — reads from
_source.html (a pristine copy of the single-page app)."""
import re, os, html
HERE=os.path.dirname(os.path.abspath(__file__))
ROOT=os.path.join(HERE,"public")
os.makedirs(ROOT,exist_ok=True)
os.chdir(ROOT)

BASE = "https://handytools.dev"
SRC = os.path.join(HERE, "_source.html")

# id -> (slug, display name, <title>, meta description, keywords, H1, intro-HTML)
TOOLS = [
 ("json","json-formatter","JSON Formatter","Free JSON Formatter & Validator | HandyTools",
  "Free online JSON formatter and validator. Paste JSON to beautify, indent, minify and validate it instantly in your browser. No signup.",
  "json formatter, json validator, json beautifier, json minifier, format json online, pretty print json",
  "JSON Formatter & Validator",
  "<p>Paste raw or minified JSON and instantly format it with clean indentation, or minify it to a single compact line. The formatter validates your JSON as it parses and shows a clear error message if the syntax is invalid — so it doubles as a JSON validator and linter.</p>"
  "<p>Everything runs locally in your browser: your data is never uploaded to a server, making it safe for sensitive payloads. Common uses include debugging API responses, cleaning up config files, and pretty-printing JSON copied from logs.</p>"),

 ("base64","base64-encoder","Base64 Encoder","Free Base64 Encoder & Decoder Online | HandyTools",
  "Free online Base64 encoder and decoder. Convert text to Base64 or decode Base64 strings back to plain text instantly. Runs in your browser, no signup.",
  "base64 encode, base64 decode, base64 encoder, base64 decoder, encode base64 online, decode base64",
  "Base64 Encoder & Decoder",
  "<p>Encode plain text into Base64 or decode a Base64 string back to readable text with one click. Base64 represents binary data as ASCII characters and is widely used for data URIs, embedding images in CSS or HTML, encoding JSON Web Tokens (JWTs), and transmitting data over text-only channels.</p>"
  "<p>The conversion is fully Unicode-safe and happens entirely in your browser, so nothing is sent to a server. Paste a token, a data URI, or any encoded string to inspect its contents.</p>"),

 ("url","url-encoder","URL Encoder","Free URL Encoder & Decoder Online | HandyTools",
  "Free online URL encoder and decoder. Percent-encode special characters for safe URLs or decode encoded strings instantly in your browser. No signup.",
  "url encode, url decode, url encoder, url decoder, percent encoding, encode url online, decode url",
  "URL Encoder & Decoder",
  "<p>Percent-encode special characters so they can travel safely inside a URL, or decode an already-encoded string back to plain text. URL encoding is essential when building query strings, working with REST APIs, or passing values that contain spaces, ampersands, slashes, or non-ASCII characters.</p>"
  "<p>Encoding and decoding run instantly in your browser with no data leaving your machine — handy for debugging redirect URLs, OAuth callbacks, and analytics parameters.</p>"),

 ("regex","regex-tester","Regex Tester","Free Regex Tester Online with Live Highlighting | HandyTools",
  "Free online regex tester. Test JavaScript regular expressions against any text with live match highlighting and flag support. Runs in your browser, no signup.",
  "regex tester, regular expression tester, test regex online, regex match, javascript regex, regex tool",
  "Regular Expression Tester",
  "<p>Write a regular expression and test it against any sample text with live, highlighted matches. Supports all standard JavaScript regex flags (global, case-insensitive, multiline and more) and shows a running count of how many matches were found.</p>"
  "<p>As you type, matches are highlighted directly in your test string so you can refine the pattern in real time — perfect for validating email formats, extracting data, or debugging a tricky expression before dropping it into your code.</p>"),

 ("uuid","uuid-generator","UUID Generator","Free UUID Generator (v4) Online | HandyTools",
  "Free online UUID generator. Create RFC 4122 version 4 UUIDs in bulk using secure randomness. Generate 1 to 100 at once in your browser. No signup.",
  "uuid generator, guid generator, uuid v4, generate uuid online, random uuid, rfc 4122",
  "UUID v4 Generator",
  "<p>Generate RFC 4122 version 4 UUIDs (also called GUIDs) using your browser's cryptographically secure random number generator. Produce anywhere from 1 to 100 identifiers at once and copy them all with a single click.</p>"
  "<p>UUIDs are used as collision-resistant primary keys in databases, request and trace IDs, session tokens, and unique file names. Because generation happens locally, the values never touch a server.</p>"),

 ("markdown","markdown-preview","Markdown Preview","Free Markdown Previewer Online | HandyTools",
  "Free online Markdown previewer. Write Markdown and see the rendered HTML update live as you type. Runs in your browser, no signup required.",
  "markdown preview, markdown editor, markdown to html, preview markdown online, markdown renderer",
  "Markdown Previewer",
  "<p>Write Markdown on the left and watch the rendered result update live on the right. Supports headings, bold and italic text, inline code, blockquotes, bulleted lists, and links — the syntax used by GitHub, Reddit, Notion, and countless docs.</p>"
  "<p>It's a fast way to draft a README, format a comment, or check how your Markdown will look before publishing. Rendering happens entirely in your browser.</p>"),

 ("wordcount","word-counter","Word Counter","Free Word & Character Counter Online | HandyTools",
  "Free online word counter. Count words, characters, sentences, lines and reading time for any text instantly in your browser. No signup required.",
  "word counter, character counter, count words online, word count tool, reading time calculator",
  "Word Counter",
  "<p>Paste or type any text to instantly see the number of words, characters (with and without spaces), lines, and sentences, plus an estimated reading time based on 200 words per minute.</p>"
  "<p>Great for staying within essay limits, social media character counts, SEO meta descriptions, and speech timing. All counting happens live in your browser as you type.</p>"),

 ("case","case-converter","Case Converter","Free Text Case Converter Online | HandyTools",
  "Free online case converter. Convert text to UPPERCASE, lowercase, Title Case, camelCase, snake_case, kebab-case and more instantly. No signup.",
  "case converter, uppercase to lowercase, title case converter, camelcase, snake case, text case tool",
  "Text Case Converter",
  "<p>Convert text between eight formats with one click: UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case. The prose cases are ideal for writing and editing; the programmer cases are perfect for renaming variables, files, and identifiers.</p>"
  "<p>Paste any text and switch instantly between formats — the conversion runs entirely in your browser.</p>"),

 ("lorem","lorem-ipsum-generator","Lorem Ipsum","Free Lorem Ipsum Generator Online | HandyTools",
  "Free online Lorem Ipsum generator. Create placeholder text by words, sentences or paragraphs for your mockups and designs. Runs in your browser, no signup.",
  "lorem ipsum generator, placeholder text, dummy text generator, lipsum, filler text",
  "Lorem Ipsum Generator",
  "<p>Generate classic Lorem Ipsum placeholder text by the word, sentence, or paragraph. Choose exactly how much you need and copy it straight into your design mockup, wireframe, or template.</p>"
  "<p>Lorem Ipsum has been the industry-standard dummy text since the 1500s because it approximates natural language without distracting readers with real content. Generation is instant and local to your browser.</p>"),

 ("password","password-generator","Password Generator","Free Strong Password Generator Online | HandyTools",
  "Free online password generator. Create strong, random passwords with custom length and character sets using secure browser randomness. No signup, nothing stored.",
  "password generator, strong password generator, random password, secure password creator, generate password",
  "Password Generator",
  "<p>Create strong, random passwords with a custom length from 4 to 128 characters and your choice of uppercase, lowercase, numbers, and symbols. Passwords are built with your browser's cryptographically secure random generator — not a predictable <code>Math.random()</code>.</p>"
  "<p>Nothing is transmitted or stored anywhere; the password exists only on your screen. A live strength indicator helps you pick a length that balances security and memorability.</p>"),

 ("color","color-converter","Color Converter","Free Color Converter — HEX, RGB, HSL | HandyTools",
  "Free online color converter. Convert colors between HEX, RGB and HSL, pick colors visually, and copy ready-to-use CSS variables. Runs in your browser, no signup.",
  "color converter, hex to rgb, rgb to hex, hsl converter, hex to hsl, css color tool, color picker",
  "Color Converter",
  "<p>Convert any color between HEX, RGB, and HSL formats and see a live preview swatch update as you go. Use the built-in color picker or type a value in any format, and the others update automatically.</p>"
  "<p>The tool also outputs ready-to-paste CSS custom properties for your stylesheet. Everything runs in your browser — ideal for design work, theming, and matching brand colors.</p>"),

 ("unit","unit-converter","Unit Converter","Free Unit Converter Online | HandyTools",
  "Free online unit converter. Convert length, weight, temperature, area, volume, speed and digital storage instantly in your browser. No signup required.",
  "unit converter, length converter, weight converter, temperature converter, metric conversion, measurement converter",
  "Unit Converter",
  "<p>Convert between units across seven categories: length, weight and mass, temperature, area, volume, speed, and digital storage. Temperature conversions use the correct formulas (not simple ratios), and results update instantly as you type.</p>"
  "<p>Whether you're switching miles to kilometers, pounds to kilograms, Celsius to Fahrenheit, or gigabytes to megabytes, the calculation happens entirely in your browser.</p>"),

 ("percent","percentage-calculator","Percentage Calculator","Free Percentage Calculator Online | HandyTools",
  "Free online percentage calculator. Work out X% of Y, what percent X is of Y, and percentage change between two numbers instantly. Runs in your browser, no signup.",
  "percentage calculator, percent calculator, percentage change, percent of a number, calculate percentage online",
  "Percentage Calculator",
  "<p>Three calculators in one: find what X% of Y is, work out what percentage X is of Y, and calculate the percentage increase or decrease between two numbers. Results update live and the percentage-change result is color-coded for gains and losses.</p>"
  "<p>Handy for discounts, tips, tax, statistics, and comparing figures — all computed instantly in your browser.</p>"),

 ("age","age-calculator","Age Calculator","Free Age Calculator Online | HandyTools",
  "Free online age calculator. Calculate exact age in years, months and days between a birth date and any date. Runs in your browser, no signup required.",
  "age calculator, calculate age, age in years months days, date difference calculator, how old am i",
  "Age Calculator",
  "<p>Enter a date of birth and an \"as of\" date to calculate an exact age broken down into years, months, and days, along with the total number of days lived. The reference date defaults to today but can be set to any date.</p>"
  "<p>Useful for birthdays, eligibility checks, anniversaries, and precise date-difference calculations — computed instantly and privately in your browser.</p>"),

 ("timestamp","timestamp-converter","Timestamp Converter","Free Unix Timestamp Converter Online | HandyTools",
  "Free online Unix timestamp converter. Convert Unix timestamps to human-readable dates and back, with a live current timestamp. Runs in your browser, no signup.",
  "unix timestamp converter, epoch converter, timestamp to date, date to timestamp, unix time, epoch time",
  "Unix Timestamp Converter",
  "<p>Convert a Unix timestamp (seconds since January 1, 1970 UTC) into a human-readable UTC string and ISO 8601 date, or turn a date and time back into its Unix timestamp. A live-updating current timestamp is always shown at the top.</p>"
  "<p>Essential for working with logs, databases, APIs, and anything that stores time as epoch seconds — all handled locally in your browser.</p>"),
]

SLUG = {tid: slug for tid, slug, *_ in TOOLS}

# id -> list of (question, answer) — feeds a visible FAQ block + FAQPage schema
FAQS = {
 "json":[
  ("How do I format JSON online?","Paste your JSON into the input box and click Format. HandyTools indents it with proper spacing and validates the syntax — all in your browser."),
  ("Is it safe to paste sensitive JSON?","Yes. All formatting happens locally in your browser; nothing is uploaded to any server."),
  ("What is the difference between Format and Minify?","Format adds indentation and line breaks for readability, while Minify strips all whitespace to produce the smallest valid JSON."),
 ],
 "base64":[
  ("How do I decode a Base64 string?","Paste the Base64 into the input and click Decode to get the original text back. Click Encode to convert the other way."),
  ("Is Base64 the same as encryption?","No. Base64 is encoding, not encryption — it is easily reversible and provides no security. Use it for transport, not secrecy."),
  ("Does it handle Unicode and emoji?","Yes. The encoder is UTF-8 safe, so accented characters and emoji encode and decode correctly."),
 ],
 "url":[
  ("When do I need URL encoding?","Whenever a value in a URL contains spaces or special characters like &, ?, =, or /. Encoding makes them safe to include in a query string."),
  ("Which encoding does this use?","It uses component encoding (encodeURIComponent), which escapes all reserved characters — the right choice for individual query-string values."),
  ("Is my data sent anywhere?","No. Encoding and decoding run entirely in your browser."),
 ],
 "regex":[
  ("Which regex flavor does this use?","JavaScript (ECMAScript) regular expressions, including flags such as g, i, m, s, and u."),
  ("How do I see all matches?","Include the g (global) flag. Matches are highlighted live in your test string with a running count."),
  ("Is my test text private?","Yes. Everything runs in your browser and nothing is transmitted."),
 ],
 "uuid":[
  ("What kind of UUIDs does this generate?","RFC 4122 version 4 UUIDs, created with your browser's cryptographically secure random number generator."),
  ("Are the UUIDs truly unique?","Version 4 UUIDs have 122 random bits, making collisions astronomically unlikely — safe as database keys and identifiers."),
  ("Can I generate many at once?","Yes. Generate 1 to 100 at a time and copy them all with a single click."),
 ],
 "markdown":[
  ("What Markdown syntax is supported?","Headings, bold, italic, inline code, blockquotes, bulleted lists, and links."),
  ("Does the preview update live?","Yes. The rendered HTML updates in real time as you type."),
  ("Is my document saved or uploaded?","No. Everything stays in your browser."),
 ],
 "wordcount":[
  ("How is reading time calculated?","Based on an average reading speed of 200 words per minute, rounded up to the nearest minute."),
  ("Does it count characters with and without spaces?","Yes. It shows both, along with words, lines, and sentences."),
  ("Does it work for any language?","It counts words by whitespace, so it works for most space-separated languages."),
 ],
 "case":[
  ("What case formats are supported?","UPPER CASE, lower case, Title Case, Sentence case, camelCase, PascalCase, snake_case, and kebab-case."),
  ("What is the difference between camelCase and PascalCase?","Both remove spaces and capitalize word boundaries; camelCase starts lowercase (myVariable) while PascalCase starts uppercase (MyVariable)."),
  ("Can I convert code identifiers?","Yes. snake_case, kebab-case, camelCase, and PascalCase are ideal for renaming variables and files."),
 ],
 "lorem":[
  ("What is Lorem Ipsum?","Standard placeholder text used in design since the 1500s to show layout without meaningful content distracting the viewer."),
  ("Can I choose how much to generate?","Yes. Generate by the word, sentence, or paragraph in any quantity."),
  ("Can I use it in commercial projects?","Yes. Lorem Ipsum is free placeholder text with no restrictions."),
 ],
 "password":[
  ("Are the passwords generated securely?","Yes. They use crypto.getRandomValues(), a cryptographically secure generator — not predictable Math.random()."),
  ("Is the password sent anywhere?","No. It is generated and shown entirely in your browser; nothing is stored or transmitted."),
  ("What makes a strong password?","Length matters most — aim for 16 or more characters mixing uppercase, lowercase, numbers, and symbols."),
 ],
 "color":[
  ("What formats can I convert between?","HEX, RGB, and HSL, with a live preview swatch and copy-ready CSS variables."),
  ("How do I convert HEX to RGB?","Enter a HEX value like #6c63ff and the RGB and HSL equivalents update instantly."),
  ("Does it output CSS variables?","Yes. It generates ready-to-paste CSS custom properties for your stylesheet."),
 ],
 "unit":[
  ("What units can I convert?","Length, weight and mass, temperature, area, volume, speed, and digital storage."),
  ("Are temperature conversions accurate?","Yes. Temperature uses the correct formulas (not simple ratios) for Celsius, Fahrenheit, and Kelvin."),
  ("Does it work offline?","Once the page has loaded, conversions run entirely in your browser."),
 ],
 "percent":[
  ("How do I find X percent of a number?","Enter the percentage and the number in the “What is X% of Y” calculator to get the result instantly."),
  ("Can it calculate percentage change?","Yes. Enter a starting and ending value to see the percentage increase or decrease, color-coded."),
  ("What can I use it for?","Discounts, tips, tax, grades, statistics, and comparing any two figures."),
 ],
 "age":[
  ("How is age calculated?","As the exact difference between the birth date and the reference date, broken into years, months, and days."),
  ("Can I calculate age on a past or future date?","Yes. Set the “as of” date to any date; it defaults to today."),
  ("Does it account for leap years?","Yes. The calculation uses real calendar months and leap years for accuracy."),
 ],
 "timestamp":[
  ("What is a Unix timestamp?","The number of seconds elapsed since January 1, 1970 UTC — known as the Unix epoch."),
  ("How do I convert a timestamp to a date?","Paste the Unix timestamp to see the UTC and ISO 8601 date, or type a date to get the timestamp back."),
  ("Does it show the current timestamp?","Yes. A live-updating current Unix timestamp is shown at the top."),
 ],
}

with open(SRC, encoding="utf-8") as f:
    src = f.read()

# ---- 1. Extract CSS ----
css = src[src.index("<style>")+7 : src.index("</style>")]
extra_css = (
 "\n    /* link-based nav (per-tool pages) */\n"
 "    a.dropdown-item, a.tb-btn, a.cp-icon { text-decoration: none; color: #000000; }\n"
 "    a.tb-btn { display: flex; align-items: center; justify-content: center; }\n"
)
with open("styles.css","w",encoding="utf-8") as f:
    f.write(css + extra_css)

# ---- 2. Extract JS and transform ----
js = src[src.index("<script>")+8 : src.rindex("</script>")]

# slug map for JS
slug_js = "const TOOL_SLUGS = " + "{" + ",".join(f'"{k}":"{v}"' for k,v in SLUG.items()) + "};\n"
js = js.replace("const TOOL_ICONS = {", slug_js + "const TOOL_ICONS = {", 1)

# icon grid -> real links
js = js.replace(
 "html += `<div class=\"cp-icon\" onclick=\"openTool('${t.id}')\" title=\"${t.name}\" tabindex=\"0\" role=\"button\" onkeydown=\"if(event.key==='Enter')openTool('${t.id}')\">",
 "html += `<a class=\"cp-icon\" href=\"/${TOOL_SLUGS[t.id]}\" title=\"${t.name}\">"
)
js = js.replace(
 "        <div class=\"cp-icon-label\">${t.name}</div>\n      </div>`;",
 "        <div class=\"cp-icon-label\">${t.name}</div>\n      </a>`;"
)
# list view rows -> real links
js = js.replace(
 "      onclick=\"openTool('${t.id}')\"\n"
 "      onmouseover=\"this.style.background='#000080';this.style.color='#fff'\"\n"
 "      onmouseout=\"this.style.background='${bg}';this.style.color='#000'\">",
 "      onclick=\"location.href='/'+TOOL_SLUGS['${t.id}']\"\n"
 "      onmouseover=\"this.style.background='#000080';this.style.color='#fff'\"\n"
 "      onmouseout=\"this.style.background='${bg}';this.style.color='#000'\">"
)
# auto-open the tool a per-tool page is for
js += "\nif (window.PAGE_TOOL) { try { openTool(window.PAGE_TOOL); } catch(e){} }\n"

with open("app.js","w",encoding="utf-8") as f:
    f.write(js)

# ---- 3. Extract + transform the shared body chrome ----
chrome = src[src.index('<div class="app-window"') : src.index('<section id="seo-content"')]
tail = src[src.index('<noscript>') : src.index('<script>')]  # noscript + taskbar

def linkify(chrome):
    # sidebar tree items
    for tid, slug in SLUG.items():
        chrome = chrome.replace(
            f'href="#" onclick="openTool(\'{tid}\');return false;"',
            f'href="/{slug}"')
    # tools menu dropdown items  ->  anchors
    def menu_sub(m):
        tid, inner = m.group(1), m.group(2)
        return f'<a class="dropdown-item" href="/{SLUG[tid]}">{inner}</a>'
    chrome = re.sub(r'<div class="dropdown-item" onclick="openTool\(\'([a-z]+)\'\);closeMenus\(\)">(.*?)</div>',
                    menu_sub, chrome)
    # File > Home dropdown item
    chrome = chrome.replace(
        '<div class="dropdown-item" onclick="showHome();closeMenus()"><span class="dropdown-check"></span>Home</div>',
        '<a class="dropdown-item" href="/"><span class="dropdown-check"></span>Home</a>')
    # toolbar Home button
    chrome = chrome.replace(
        '<button class="tb-btn" onclick="showHome()" title="Home">🏠 Home</button>',
        '<a class="tb-btn" href="/" title="Home">🏠 Home</a>')
    # toolbar quick buttons
    for tid, slug in SLUG.items():
        chrome = chrome.replace(
            f'<button class="tb-btn tb-quick" onclick="openTool(\'{tid}\')"',
            f'<button class="tb-btn tb-quick" onclick="location.href=\'/{slug}\'"')
    # window close + taskbar -> home
    chrome = chrome.replace('onclick="showHome()">✕</button>', 'onclick="location.href=\'/\'">✕</button>')
    return chrome

chrome = linkify(chrome)
tail = tail.replace('<button class="taskbar-task" onclick="showHome()">',
                    '<button class="taskbar-task" onclick="location.href=\'/\'">')

FAV = ('<link rel="icon" href="/favicon.svg" type="image/svg+xml" />\n'
       '  <link rel="icon" href="/favicon.ico" sizes="32x32" />\n'
       '  <link rel="apple-touch-icon" href="/favicon.svg" />')

def page(head_inner, content_html, page_tool=None):
    pt = f'\n<script>window.PAGE_TOOL={page_tool!r};</script>' if page_tool else ''
    return (f"<!DOCTYPE html>\n<html lang=\"en\">\n<head>\n{head_inner}\n"
            f"  <link rel=\"stylesheet\" href=\"/styles.css\" />\n</head>\n<body>\n\n"
            f"{chrome}\n{content_html}\n{tail}{pt}\n<script src=\"/app.js\"></script>\n</body>\n</html>\n")

# ---- 4. index.html (hub) ----
home_head = src[src.index("<head>")+6 : src.index("<style>")].rstrip()
_seo_start = src.index('<section id="seo-content"')
home_content = src[_seo_start : src.index('</section>', _seo_start)+10]
with open("index.html","w",encoding="utf-8") as f:
    f.write(page(home_head, home_content))

# ---- 5. per-tool pages ----
SEO_STYLE = ('width:820px;max-width:calc(100% - 16px);margin:12px auto 0;background:#C0C0C0;'
 'border-top:2px solid #fff;border-left:2px solid #fff;border-bottom:2px solid #808080;'
 'border-right:2px solid #808080;outline:1px solid #000;padding:12px 16px;'
 "font-family:'MS Sans Serif',Arial,sans-serif;font-size:11px;line-height:1.7;color:#000;")

for i,(tid,slug,name,title,desc,kw,h1,intro) in enumerate(TOOLS):
    url = f"{BASE}/{slug}"
    crumb = {"@context":"https://schema.org","@type":"BreadcrumbList","itemListElement":[
        {"@type":"ListItem","position":1,"name":"Home","item":BASE+"/"},
        {"@type":"ListItem","position":2,"name":name,"item":url}]}
    webapp = {"@context":"https://schema.org","@type":"WebApplication","name":name+" — HandyTools",
        "url":url,"applicationCategory":"DeveloperApplication","operatingSystem":"Web",
        "description":desc,"offers":{"@type":"Offer","price":"0","priceCurrency":"USD"},
        "isPartOf":{"@type":"WebSite","name":"HandyTools","url":BASE+"/"}}
    faqpage = {"@context":"https://schema.org","@type":"FAQPage","mainEntity":[
        {"@type":"Question","name":q,"acceptedAnswer":{"@type":"Answer","text":a}}
        for q,a in FAQS[tid]]}
    import json
    head = (
     f'  <meta charset="UTF-8" />\n'
     f'  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
     f'  <title>{html.escape(title)}</title>\n'
     f'  <meta name="description" content="{html.escape(desc)}" />\n'
     f'  <meta name="keywords" content="{html.escape(kw)}" />\n'
     f'  <meta name="robots" content="index, follow, max-snippet:-1, max-image-preview:large" />\n'
     f'  <meta name="theme-color" content="#000080" />\n'
     f'  <link rel="canonical" href="{url}" />\n'
     f'  <meta property="og:type" content="website" />\n'
     f'  <meta property="og:title" content="{html.escape(name)} — Free Online Tool | HandyTools" />\n'
     f'  <meta property="og:description" content="{html.escape(desc)}" />\n'
     f'  <meta property="og:url" content="{url}" />\n'
     f'  <meta property="og:site_name" content="HandyTools" />\n'
     f'  <meta name="twitter:card" content="summary" />\n'
     f'  <meta name="twitter:title" content="{html.escape(name)} — HandyTools" />\n'
     f'  <meta name="twitter:description" content="{html.escape(desc)}" />\n'
     f'  {FAV}\n'
     f'  <script type="application/ld+json">{json.dumps(webapp)}</script>\n'
     f'  <script type="application/ld+json">{json.dumps(crumb)}</script>\n'
     f'  <script type="application/ld+json">{json.dumps(faqpage)}</script>'
    )
    others = " · ".join(f'<a href="/{s}" style="color:#000080;">{n}</a>'
                        for t2,s,n,*_ in TOOLS if t2!=tid)
    faq_html = ('  <h2 style="font-size:12px;font-weight:bold;margin:12px 0 4px;">Frequently asked questions</h2>\n'
                + "\n".join(
                    f'  <p style="margin:6px 0;"><strong>{html.escape(q)}</strong><br>{html.escape(a)}</p>'
                    for q,a in FAQS[tid]))
    content = (
     f'<section id="seo-content" aria-label="{html.escape(name)} description" style="{SEO_STYLE}">\n'
     f'  <h1 style="font-size:15px;font-weight:bold;border-bottom:1px solid #808080;padding-bottom:4px;margin-bottom:8px;">{html.escape(h1)} — Free Online Tool</h1>\n'
     f'  {intro}\n'
     f'{faq_html}\n'
     f'  <p style="margin-top:8px;"><a href="/" style="color:#000080;">&larr; All 15 HandyTools</a></p>\n'
     f'  <h2 style="font-size:12px;font-weight:bold;margin:10px 0 4px;">Other free tools</h2>\n'
     f'  <p>{others}</p>\n'
     f'</section>'
    )
    with open(f"{slug}.html","w",encoding="utf-8") as f:
        f.write(page(head, content, page_tool=tid))

# ---- 404 page ----
nf_head = (
 '  <meta charset="UTF-8" />\n'
 '  <meta name="viewport" content="width=device-width, initial-scale=1.0" />\n'
 '  <title>404 Not Found | HandyTools</title>\n'
 '  <meta name="robots" content="noindex, follow" />\n'
 '  <meta name="theme-color" content="#000080" />\n'
 '  ' + FAV
)
nf_content = (
 '<section id="seo-content" style="' + SEO_STYLE + '">\n'
 '  <h1 style="font-size:15px;font-weight:bold;border-bottom:1px solid #808080;padding-bottom:4px;margin-bottom:8px;">Error 404 &mdash; Page Not Found</h1>\n'
 '  <p>The page you requested could not be found. It may have been moved or never existed.</p>\n'
 '  <p style="margin-top:8px;"><a href="/" style="color:#000080;">&larr; Return to HandyTools home</a></p>\n'
 '</section>'
)
with open("404.html","w",encoding="utf-8") as f:
    f.write(page(nf_head, nf_content))

# ---- 6. sitemap ----
urls = [(BASE+"/", "1.0")] + [(f"{BASE}/{slug}", "0.8") for _,slug,*_ in TOOLS]
sm = ['<?xml version="1.0" encoding="UTF-8"?>',
      '<urlset xmlns="http://www.sitemaps.org/schemas/sitemap/0.9">']
for loc,pri in urls:
    sm += ["  <url>", f"    <loc>{loc}</loc>", "    <lastmod>2026-07-05</lastmod>",
           "    <changefreq>monthly</changefreq>", f"    <priority>{pri}</priority>", "  </url>"]
sm.append("</urlset>")
with open("sitemap.xml","w",encoding="utf-8") as f:
    f.write("\n".join(sm)+"\n")

print(f"Built: index.html + {len(TOOLS)} tool pages + styles.css + app.js + sitemap.xml")
