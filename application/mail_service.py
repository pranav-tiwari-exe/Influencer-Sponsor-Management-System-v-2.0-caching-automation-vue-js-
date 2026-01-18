from smtplib import SMTP
from email.mime.multipart import MIMEMultipart
from email.mime.text import MIMEText


SMTP_HOST="localhost"
SMTP_PORT=1025
SENDER_EMAIL='adobesoftware765@gmail.com'
SENDER_PASSWORD='*********'

def send_email(to,subject,content):
    msg=MIMEMultipart()
    msg['to']=to
    msg['subject']=subject
    msg['from']=SENDER_EMAIL
    msg.attach(MIMEText(content,'html'))
    client=SMTP(host=SMTP_HOST,port=SMTP_PORT)
    client.send_message(msg=msg)
    client.quit()
