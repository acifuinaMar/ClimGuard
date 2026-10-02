using Application.Comunidad.Service;
using Application.Comunidad.Service.Queries;
using Application.Usuario.Service;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;


namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class ComunidadController : ControllerBase
    {
        private readonly IMediator _mediator;

        public ComunidadController(IMediator mediator)
        {
            _mediator = mediator;
        }

        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new ComunidadGetAllQuery());

            return Ok(result);
        }

        [HttpGet("{id:int}")]
        public async Task<IActionResult> GetById(int id)
        {
            var result = await _mediator.Send(
                new ComunidadGetByIdQuery(id)
            );

            return Ok(result);
        }
        [HttpPost]
        public async Task<IActionResult> Create([FromBody] CreateComunidadCommand command)
        {
            var result = await _mediator.Send(command);

            return CreatedAtAction(
                nameof(GetById),
                new { id = result.ComunidadId },
                result
            );
        }

        [HttpPut("{id:int}")]
        public async Task<IActionResult> Update(int id,[FromBody] UpdateComunidadCommand command)
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
                new DeleteComunidadCommand(id, usuarioLogeado)
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
