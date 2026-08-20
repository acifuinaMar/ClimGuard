using Microsoft.Extensions.Configuration;
using Microsoft.IdentityModel.Tokens;
using System.IdentityModel.Tokens.Jwt;
using System.Security.Claims;
using System.Text;

namespace Infraestructure.Security
{
    public class JwtService
    {
        private readonly JwtSettings _settings;
        private readonly IConfiguration _configuration;

        public JwtService(JwtSettings settings, IConfiguration configuration)
        {
            _settings = settings;
            _configuration = configuration;
        }

        public string GenerateToken(int username, string rol)
        {
            //string typerol = string.Empty;
            //if (rol == 1)
            //{
            //    typerol = "Administrator";
            //}
            //else if (rol == 2)
            //{
            //    typerol = "Coordinator";
            //}

            var userClaims = new[]
            {
                new Claim(ClaimTypes.NameIdentifier, username.ToString()),
                new Claim(ClaimTypes.Role, rol)
            };

            var securityKey = new SymmetricSecurityKey(Encoding.UTF8.GetBytes(_configuration["Jwt:key"]!));
            var credentials = new SigningCredentials(securityKey, SecurityAlgorithms.HmacSha256Signature);

            //create detail token
            var jwtConfig = new JwtSecurityToken(
                claims: userClaims,
                expires: DateTime.UtcNow.AddMinutes(10),
                signingCredentials: credentials
                );
            return new JwtSecurityTokenHandler().WriteToken(jwtConfig);
        }
    }
}
