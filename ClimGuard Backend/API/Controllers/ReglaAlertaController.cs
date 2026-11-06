using Application.Comunidad.Service;
using Application.Comunidad.Service.Queries;
using Application.ReglaAlerta.Service;
using Application.ReglaAlerta.Service.Queries;
using Domain.Entities.ReglaAlerta;
using Domain.Interfaces;
using MediatR;
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
        private readonly IMediator _mediator;

        public ReglaAlertaController(IReglaAlerta repository, IMediator mediator)
        {
            _repository = repository;
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new ReglaAlertaGetAllQuery());
            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new ReglaAlertaGetByIdQuery(id)
            );

            return Ok(result);
        }

        [Authorize(Roles = "Administrador")]
        [HttpGet("{tipoSensorId}")]
        public async Task<IActionResult> GetByTipoSensor(int tipoSensorId)
        {
            var regla = await _repository.GetByTipoSensor(tipoSensorId);
            return Ok(regla);
        }

        [Authorize(Roles = "Administrador")]
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateReglaAlertaCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.reglaAlertaId },
                result
            );
        }

        [Authorize(Roles = "Administrador")]
        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateReglaAlertaCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }


        [Authorize(Roles = "Administrador")]
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int usuarioLogeado)
        {
            await _mediator.Send(
                new DeleteReglaAlertaCommand(id, usuarioLogeado)
                );
            return NoContent();
        }
    }
}