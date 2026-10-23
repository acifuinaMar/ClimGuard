using Application.NivelAlerta.Service;
using Application.NivelAlerta.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Administrador,Operador,Consulta")]
    [Route("api/[controller]")]
    [ApiController]
    public class NivelAlertaController : ControllerBase
    {
        private readonly IMediator _mediator;

        public NivelAlertaController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new NivelAlertaGetAllQuery());

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new NivelAlertaGetByIdQuery(id)
            );

            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateNivelAlertaCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.nivelAlertaId },
                result
            );
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateNivelAlertaCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        //localhost:5093/api/usuario/2?usuarioLogeado=1
        //usuario/2 = el id del usuario a eliminar
        //?usuarioLogeado=1 = id del usuario quien inicio sesion
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int usuarioLogeado)
        {
            await _mediator.Send(
                new DeleteNivelAlertaCommand(id, usuarioLogeado)
                );
            return NoContent();
        }
    }
}
