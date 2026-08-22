using Domain.Entities.Umbral;
using Domain.Interfaces;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Route("api/[controller]")]
    [ApiController]
    public class UmbralController : ControllerBase
    {
        private readonly IUmbral _repository;

        public UmbralController(IUmbral repository)
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
            var umbral = await _repository.GetByTipoSensor(tipoSensorId);
            return Ok(umbral);
        }

        [HttpPut("{tipoSensorId}")]
        public async Task<IActionResult> Update(
            int tipoSensorId,
            [FromBody] UmbralDomain umbral)
                {
                    if (tipoSensorId != umbral.TipoSensorId)
                    {
                        return BadRequest("El TipoSensorId no coincide.");
                    }

                    var actualizado = await _repository.Update(umbral);

                    return Ok(actualizado);
                }
    }


}