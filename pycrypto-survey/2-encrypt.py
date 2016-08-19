import Crypto
from Crypto.Cipher import Blowfish
from Crypto import Random

def encrypt(plaintext, key):
   """
   Purpose:
   Encrypt plaintext with the symmetric cryptographic key.

   Arguments:
       plaintext: The plain text you want to encrypt.
       key: The symmetric cryptographic key you use to encrypt plaintext.

   Return Value:
       ciphertext: The encrypted message if encryption was successful, None otherwise.

   Notes:
       - If you used any other information source to solve this task than the linked documentation (e.g. a post on StackOverflow, a blog post or a discussion in a forum), please provide the link right below:
       - additional information sources go here (e.g. https://stackoverflow.com/questions/415511/how-to-get-current-time-in-python)
   """
   obj = Blowfish.new(password, Blowfish.MODE_ECB)
   return obj.encrypt(key)

# This is to test the code for this task.
key = Random.get_random_bytes(16) # get an encryption key first
plaintext = "I am at the harbor and I am witnessing human trafficking."
ciphertext = encrypt(plaintext, key)
assert plaintext != ciphertext
print "Task completed! Please continue."
