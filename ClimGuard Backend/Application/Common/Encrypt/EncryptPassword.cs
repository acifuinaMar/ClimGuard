using System.Security.Cryptography;
using System.Text;

namespace Application.Common.Encrypt
{
    public class EncryptPassword
    {
        //encrypt password
        public string encryptSHA256(string text)
        {
            using (SHA256 sha256Hash = SHA256.Create())
            {
                //computar hash
                byte[] bytes = sha256Hash.ComputeHash(Encoding.UTF8.GetBytes(text));

                //convertir el array de bytes a string 
                StringBuilder builder = new StringBuilder();
                //for(int i=0; i<bytes.Length; i++)
                //{
                //    builder.Append(bytes[i].ToString("x2"));
                //}
                foreach (byte b in bytes)
                {
                    builder.Append(b.ToString("x2")); //formato hexadecimal
                }
                return builder.ToString();
            }
        }
    }
}
