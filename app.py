############################################################################################
#############################################WORKING CODE###################################
#############################################SUMMARY RETAINS CONTEXT########################
import os
import openai
from flask import Flask, render_template, request, jsonify, Response
from dotenv import load_dotenv

load_dotenv()
openai.api_key = os.getenv("OPENAI_API_KEY")

app = Flask(__name__)

@app.route("/")
def index():
    return render_template("index.html")

@app.route("/summarize", methods=["POST"])
def summarize():
    transcript = request.form.get("transcript")
    if not transcript:
        return jsonify({"error": "Please provide a transcript."}), 400

    summary = ""
    summary_generator = summarize_in_chunks(transcript)

    for summary_chunk in summary_generator:
        summary += summary_chunk

    condensed_summary = reduce_summary(summary)

    # parse the summary into separate sections
    tldr_start_idx = condensed_summary.find("tl;dr:")
    tldr_end_idx = condensed_summary.find("Actionable insights for the Product Management team:")
    if tldr_start_idx != -1 and tldr_end_idx != -1:
        tldr = condensed_summary[tldr_start_idx + 6:tldr_end_idx].strip()
    else:
        tldr = ""

    pm_start_idx = condensed_summary.find("Actionable insights for the Product Management team:")
    pm_end_idx = condensed_summary.find("Actionable insights for the Business Development team:")
    if pm_start_idx != -1 and pm_end_idx != -1:
        pm_insights = condensed_summary[pm_start_idx + len("Actionable insights for the Product Management team:"):pm_end_idx].strip().split("\n")
    else:
        pm_insights = []

    bd_start_idx = condensed_summary.find("Actionable insights for the Business Development team:")
    if bd_start_idx != -1:
        bd_insights = condensed_summary[bd_start_idx + len("Actionable insights for the Business Development team:"):].strip().split("\n")
    else:
        bd_insights = []

    return jsonify({
        "tldr": tldr,
        "product_team": [insight.strip("- ") for insight in pm_insights],
        "business_development_team": [insight.strip("- ") for insight in bd_insights]
    })


def summarize_in_chunks(transcript):
    max_transcript_length = 10000

    while transcript:
        truncated_transcript = transcript[:max_transcript_length]
        remaining_transcript = transcript[max_transcript_length:]
        transcript = remaining_transcript

        summary = generate_summary(truncated_transcript)
        yield summary

        if not remaining_transcript:
            break

def generate_summary(transcript):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    response = openai.ChatCompletion.create(
        max_tokens=1000,
        model=os.getenv("CHAT_MODEL"),
        messages=[
            {"role": "system", "content": "You are a summarizer assistant. Your task is to synthesize meeting transcripts to obtain actionable insights relevant to the Product Management team and the Business Development team."},
            {"role": "user", "content": f"The Product Management team is interested in topics related to product features, bugs, and user feedback - specific implementation requirements should be explicitly called out. The Business Development team is looking for information about potential partnerships and market opportunities - ensure any relevant potential customers or partners are noted. Please summarize the following meeting transcript considering these points. Your response must include the following sections: 'tl;dr:', 'Actionable insights for the Product Management team:', and 'Actionable insights for the Business Development team:'.\n{transcript}\n"},
        ]
    )
    print(response)
    summary = response.choices[0]['message']['content'].strip()
    
    return summary


def reduce_summary(summary):
    openai.api_key = os.getenv("OPENAI_API_KEY")

    response = openai.ChatCompletion.create(
        max_tokens=1000,
        model=os.getenv("CHAT_MODEL"),
        messages=[
            {"role": "system", "content": "You are a summarizer assistant. Your task is to condense the summarized meeting transcript into an overall tl;dr of the meeting and then bullet points for the product team and the business development team."},
            {"role": "user", "content": f"Here is the summarized meeting transcript. Please generate the tl;dr and the actionable insights for the product and business development teams. Ensure that, if there are any specific implementation requirements for the product team, that they are explicityly called out. Additionally, any potential customer or partner names relevant to business development should be noted as well. The meeting summary is as follows:\n{summary}\n"},
        ]
    )

    condensed_summary = response.choices[0]['message']['content'].strip()
    return condensed_summary

if __name__ == "__main__":
    app.run(debug=True)

