import os
from solana.publickey import PublicKey

os.environ.setdefault('SWITCHBOARD_PID', 'SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f')


PROGRAM_ID = PublicKey(os.environ['SWITCHBOARD_PID'] or "SW1TCH7qEPTdLsDHRgPuMQjbQxKdH2aBStViMFnt64f")
