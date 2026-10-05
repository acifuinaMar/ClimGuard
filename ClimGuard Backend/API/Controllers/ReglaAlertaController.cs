using Domain.Entities.ReglaAlerta;
using Domain.Interfaces;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Operador, Administrador, Consulta")]
    [Route("api/[controller]")]
    [ApiController]
    public class ReglaAlertaController : ControllerBase
    {
        private readonly IReglaAlerta _repository;

        public ReglaAlertaController(IReglaAlerta repository)
        {
            _repository = repository;
        }

        [HttpGet]
        public async Task<IActionResult> Get()
        {
            var lista = await _repository.GetAll();
            return Ok(lista);
        }

        [HttpGet("{tipoSensorId}")]
        public async Task<IActionResult> GetByTipoSensor(int tipoSensorId)
        {
            var regla = await _repository.GetByTipoSensor(tipoSensorId);
            return Ok(regla);
        }

        [HttpPut("{reglaAlertaId}")]
        public async Task<IActionResult> Update(
            int reglaAlertaId,
            [FromBody] ReglaAlertaDomain regla)
        {
            if (reglaAlertaId != regla.ReglaAlertaId)
            {
                return BadRequest("El ReglaAlertaId no coincide.");
            }

            var actualizado = await _repository.Update(regla);

            return Ok(actualizado);
        }
}
}