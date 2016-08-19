import Crypto
from Crypto.Cipher import Blowfish
from Crypto import Random

def decrypt(ciphertext, key):
   """
   Purpose:
   Decrypt ciphertext with the symmetric cryptographic key.

   Arguments:
       ciphertext: The cipher text you want to decrypt.
       key: The symmetric cryptographic key you use to decrypt ciphertext.

   Return value:
       plaintext: The decrypted plain text if decryption was successful, None otherwise.

   Notes:
       - If you used any other information source to solve this task than the linked documentation (e.g. a post on StackOverflow, a blog post or a discussion in a forum), please provide the link right below:
       - additional information sources go here (e.g. https://stackoverflow.com/questions/415511/how-to-get-current-time-in-python)
   """
   # Hm, not really clear to handle the "Input strings must be a multiple of 8 in length"
   # ideally, it would be handled by the library.
   # Here, for simplicity just remove trailing XXXX
   obj = Blowfish.new(key, Blowfish.MODE_ECB)
   text = obj.decrypt(ciphertext)
   while text[-1:] == 'X':
      text = text[:-1]
   return text

# This is to test the code for this task.
key = read_key_from_file("secretpassword") # get an encryption key first
plaintext = "I am at the harbor and I am witnessing human trafficking."
ciphertext = encrypt(plaintext, key)
assert decrypt(ciphertext, key) == plaintext
print "Task completed! Please continue."
