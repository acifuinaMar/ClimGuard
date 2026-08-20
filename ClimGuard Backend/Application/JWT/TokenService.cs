using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Application.JWT
{
    public class TokenService
    {
        private readonly IConfiguration _configuration;

        public TokenService(IConfiguration configuration)
        {
            _configuration = configuration;
        }

        public string GenerateToken(string username, string rol)
        {
            
            if(!string.IsNullOrEmpty(username) && !string.IsNullOrEmpty(rol))
            {
                string typerol = string.Empty;


                //var roleMap = new Dictionary<int, string>
                //{
                //    { 1, "Administrator"},
                //    { 2, "Educator" }
                //};
                //if (IdUser == "1633" || IdUser =="1299")
                //{
                //    rol = 1;
                //}
                //else
                //{
                //    rol = 2;
                //}

                //var typeRol = rol && roleMap.ContainsKey(rol)
                //    ? roleMap[rol] : "Guest"; //rol por defecto

                var userClaims = new[] //las claims son datos del cual se va a generar el token
                {
                new Claim(ClaimTypes.NameIdentifier, username),
                new Claim(ClaimTypes.Role, rol),
                new Claim(JwtRegisteredClaimNames.Jti, Guid.NewGuid().ToString()) // ID único del token
            };

                //configuracion de firma
                var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:key"]!));//crea la la clave de firma usando la clave secreta
                var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);//usa el algoritmo HmacSha256Signature para firmar el token

                //create detail token
                var jwtConfig = new JwtSecurityToken(
                    issuer: _configuration["Jwt:Issuer"],
                    audience: _configuration["Jwt:Audience"],
                    claims: userClaims,
                    expires: DateTime.UtcNow.AddMinutes(
                        Convert.ToDouble(_configuration["Jwt:ExpirationMinutes"] ?? "15")
                        ),
                    signingCredentials: credentials
                    );
                return new JwtSecurityTokenHandler().WriteToken(jwtConfig);//convierte el token a string que se envia al cliente
            }
            else
            {
                return "";
            }

        }
    }
}
