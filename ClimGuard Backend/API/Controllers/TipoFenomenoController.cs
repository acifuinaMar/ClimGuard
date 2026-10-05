using Application.TipoFenomeno.Service;
using Application.TipoFenomeno.Service.Queries;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize(Roles = "Administrador,Operador")]
    [Route("api/[controller]")]
    [ApiController]
    public class TipoFenomenoController : ControllerBase
    {
        private readonly IMediator _mediator;

        public TipoFenomenoController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new TipoFenomenoGetAllQuery());

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new TipoFenomenoGetByIdQuery(id)
            );

            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateTipoFenomenoCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.TipoFenomenoId },
                result
            );
        }

        [HttpPut]
        public async Task<IActionResult> Update([FromBody] UpdateTipoFenomenoCommand command)
        {
            var result = await _mediator.Send(command);

            return Ok(result);
        }

        //localhost:5093/api/comunidad/2?usuarioLogeado=1
        //comunidad/2 = el id de la comunidad a eliminar
        //?usuarioLogeado=1 = id del usuario quien inicio sesion
        [HttpDelete("{id:int}")]
        public async Task<IActionResult> Delete(int id, [FromQuery] int usuarioLogeado)
        {
            await _mediator.Send(
                new DeleteTipoFenomenoCommand(id, usuarioLogeado)
                );
            return NoContent();
        }

        //[HttpDelete("{id:int}")]
        //public async Task<IActionResult> Delete(int id, int usuarioLogeado)
        //{
        //    await _mediator.Send(
        //        new DeleteComunidadCommand(id, usuarioLogeado)
        //    );

        //    return NoContent();
        //}

    }
}
