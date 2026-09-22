from sarvamai import SarvamAI
from sarvamai.play import save

client = SarvamAI(
    api_subscription_key="sk_nocjuf8k_lMDdLfZuGgB7sqi4GvBfbjKn"
)

audio = client.text_to_speech.convert(
    text="નમસ્તે! સરવમ AI માં તમારું સ્વાગત છે.",
    model="bulbul:v3",
    language_code="gu-IN",
    speaker="priya"
)

save(audio, "output.wav")