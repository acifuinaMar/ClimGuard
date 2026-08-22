using Application.Bitacora.Sevice.Query;
using MediatR;
using Microsoft.AspNetCore.Authorization;
using Microsoft.AspNetCore.Mvc;

namespace API.Controllers
{
    [Authorize]
    [Route("api/[controller]")]
    [ApiController]
    public class BitacoraController : ControllerBase
    {
        private readonly IMediator _mediator;

        public BitacoraController(IMediator mediator)
        {
            _mediator = mediator;
        }

        // GET /api/Bitacora
        [HttpGet]
        public async Task<IActionResult> GetAll()
        {
            var result = await _mediator.Send(new BitacoraGetAllQuery());

            return Ok(result);
        }
    }
}
