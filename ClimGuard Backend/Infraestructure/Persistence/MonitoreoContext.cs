using System;
using System.Collections.Generic;
using Infraestructure.Models;
using Microsoft.EntityFrameworkCore;

namespace Infraestructure.Persistence;

public partial class MonitoreoContext : DbContext
{
    public MonitoreoContext()
    {
    }

    public MonitoreoContext(DbContextOptions<MonitoreoContext> options)
        : base(options)
    {
    }

    public virtual DbSet<Alerta> Alerta { get; set; }

    public virtual DbSet<Bitacora> Bitacoras { get; set; }

    public virtual DbSet<Comunidad> Comunidads { get; set; }

    public virtual DbSet<EstadoAlerta> EstadoAlerta { get; set; }

    public virtual DbSet<LecturaSensor> LecturaSensors { get; set; }

    public virtual DbSet<NivelAlerta> NivelAlerta { get; set; }

    public virtual DbSet<Notificacion> Notificacions { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<Sensor> Sensors { get; set; }

    public virtual DbSet<TipoFenomeno> TipoFenomenos { get; set; }

    public virtual DbSet<TipoSensor> TipoSensors { get; set; }

    public virtual DbSet<ReglaAlerta> ReglaAlertas { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    public virtual DbSet<EstadoSensor> EstadoSensors { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Alerta>(entity =>
        {
            entity.HasKey(e => e.AlertaId)
                .HasName("PK_Alerta");

            entity.ToTable("Alerta");

            entity.Property(e => e.ValorDetectado)
                .HasColumnType("decimal(10,2)");

            entity.Property(e => e.MensajeSnap)
                .HasMaxLength(300);

            entity.Property(e => e.FechaHora)
                .HasColumnType("datetime")
                .HasDefaultValueSql("(getdate())");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);

            entity.HasOne(d => d.Comunidad)
                .WithMany(p => p.Alerta)
                .HasForeignKey(d => d.ComunidadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_Comunidad");

            entity.HasOne(d => d.Sensor)
                .WithMany(p => p.Alerta)
                .HasForeignKey(d => d.SensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_Sensor");

            entity.HasOne(d => d.ReglaAlerta)
                .WithMany(p => p.Alerta)
                .HasForeignKey(d => d.ReglaAlertaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_ReglaAlerta");

            entity.HasOne(d => d.EstadoAlerta)
                .WithMany(p => p.Alerta)
                .HasForeignKey(d => d.EstadoAlertaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_EstadoAlerta");

            entity.HasOne(d => d.UsuarioResponsableNavigation)
                .WithMany(p => p.Alertas)
                .HasForeignKey(d => d.UsuarioResponsable)
                .HasConstraintName("FK_Alerta_Usuario");
        });
        
        modelBuilder.Entity<Bitacora>(entity =>
        {
            entity.HasKey(e => e.BitacoraId)
                .HasName("PK_Bitacora");

            entity.ToTable("Bitacora");

            entity.Property(e => e.NombreEntidad)
                .HasMaxLength(100);

            entity.Property(e => e.EntidadId);

            entity.Property(e => e.Accion)
                .HasMaxLength(50);

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500);

            entity.Property(e => e.FechaHora)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Usuario)
                .WithMany(p => p.Bitacoras)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bitacora_Usuario");
        });

        modelBuilder.Entity<Comunidad>(entity =>
        {
            entity.HasKey(e => e.ComunidadId)
                .HasName("PK_Comunidad");

            entity.ToTable("Comunidad");

            entity.Property(e => e.NombreComunidad)
                .HasMaxLength(150);

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500);

            entity.Property(e => e.Pais)
                .HasMaxLength(100);

            entity.Property(e => e.Departamento)
                .HasMaxLength(100);

            entity.Property(e => e.Municipio)
                .HasMaxLength(100);

            entity.Property(e => e.Latitud)
                .HasColumnType("decimal(9,6)");

            entity.Property(e => e.Longitud)
                .HasColumnType("decimal(9,6)");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);

            entity.Property(e => e.FechaIng)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime2");

            entity.Property(e => e.FechaAct)
                .HasColumnType("datetime2");

            entity.HasOne(d => d.UsuarioIngNavigation)
                .WithMany()
                .HasForeignKey(d => d.UsuarioIng)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Comunidad_UsuarioIng");

            entity.HasOne(d => d.UsuarioActNavigation)
                .WithMany()
                .HasForeignKey(d => d.UsuarioAct)
                .HasConstraintName("FK_Comunidad_UsuarioAct");
        });
        modelBuilder.Entity<EstadoAlerta>(entity =>
        {
            entity.HasKey(e => e.EstadoAlertaId).HasName("PK__EstadoAl__C73CE723D9883744");

            entity.Property(e => e.Estado).HasMaxLength(50);
        });

        modelBuilder.Entity<EstadoSensor>(entity =>
        {
            entity.HasKey(e => e.EstadoSensorId)
                .HasName("PK_EstadoSensor");

            entity.ToTable("EstadoSensor");

            entity.Property(e => e.Nombre)
                .HasMaxLength(50);

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);
        });

        modelBuilder.Entity<LecturaSensor>(entity =>
        {
            entity.HasKey(e => e.LecturaId)
                .HasName("PK_Lectura");

            entity.ToTable("Lectura");

            entity.Property(e => e.Valor)
                .HasColumnType("decimal(10,2)");

            entity.Property(e => e.FechaHora)
                .HasColumnType("datetime")
                .HasDefaultValueSql("(getdate())");

            entity.HasOne(d => d.Sensor)
                .WithMany(p => p.LecturaSensors)
                .HasForeignKey(d => d.SensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Lectura_Sensor");

            entity.HasOne(d => d.UsuarioIngNavigation)
                .WithMany()
                .HasForeignKey(d => d.UsuarioIng)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Lectura_Usuario");
        });

        modelBuilder.Entity<NivelAlerta>(entity =>
        {
            entity.HasKey(e => e.NivelAlertaId).HasName("PK__NivelAle__A4F58C2E94887632");

            entity.HasIndex(e => e.Nombre, "UQ__NivelAle__75E3EFCF38AAE5BB").IsUnique();

            entity.Property(e => e.ColorHex).HasMaxLength(7);
            entity.Property(e => e.Nombre).HasMaxLength(20);
        });

        modelBuilder.Entity<Notificacion>(entity =>
        {
            entity.HasKey(e => e.NotificacionId).HasName("PK__Notifica__BCC12024275ADBA7");

            entity.ToTable("Notificacion");

            entity.Property(e => e.FechaEnvio)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Leido).HasDefaultValue(false);
        });

        modelBuilder.Entity<Rol>(entity =>
        {
            entity.HasKey(e => e.RolId).HasName("PK__Rol__F92302F1FFCA6743");

            entity.ToTable("Rol");

            entity.Property(e => e.Nombre)
                .HasMaxLength(50);

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);

            entity.Property(e => e.FechaIng)
                .HasColumnType("datetime2");

            entity.Property(e => e.FechaAct)
                .HasColumnType("datetime2");
        });

        modelBuilder.Entity<Sensor>(entity =>
        {
            entity.HasKey(e => e.SensorId)
                .HasName("PK_Sensor");

            entity.ToTable("Sensor");

            entity.Property(e => e.Nombre)
                .HasMaxLength(100);

            entity.Property(e => e.Codigo)
                .HasMaxLength(50);

            entity.Property(e => e.Ubicacion)
                .HasMaxLength(200);

            entity.Property(e => e.Descripcion)
                .HasMaxLength(500);

            entity.Property(e => e.FechaInstalacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");

            entity.Property(e => e.FechaUltimaConexion)
                .HasColumnType("datetime");

            entity.HasOne(d => d.Comunidad)
                .WithMany(p => p.Sensors)
                .HasForeignKey(d => d.ComunidadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sensor_Comunidad");

            entity.HasOne(d => d.TipoSensor)
                .WithMany(p => p.Sensors)
                .HasForeignKey(d => d.TipoSensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sensor_TipoSensor");

            entity.HasOne(d => d.EstadoSensor)
                .WithMany(p => p.Sensors)
                .HasForeignKey(d => d.EstadoSensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sensor_EstadoSensor");
        });
        
        modelBuilder.Entity<TipoFenomeno>(entity =>
        {
            entity.HasKey(e => e.TipoFenomenoId).HasName("PK__TipoFeno__7B7F8DA465FDB4C4");

            entity.ToTable("TipoFenomeno");

            entity.HasIndex(e => e.Nombre, "UQ__TipoFeno__75E3EFCF483559A7").IsUnique();

            entity.Property(e => e.Nombre).HasMaxLength(50);
        });

        modelBuilder.Entity<TipoSensor>(entity =>
        {
            entity.HasKey(e => e.TipoSensorId).HasName("PK__TipoSens__1BC9C52E0E71527F");

            entity.ToTable("TipoSensor");

            entity.HasIndex(e => e.Nombre, "UQ__TipoSens__75E3EFCF08EF17D9").IsUnique();

            entity.Property(e => e.Nombre).HasMaxLength(50);
            entity.Property(e => e.UnidadMedida).HasMaxLength(20);
        });

        modelBuilder.Entity<ReglaAlerta>(entity =>
        {
            entity.HasKey(e => e.ReglaAlertaId)
                .HasName("PK_ReglaAlerta");

            entity.ToTable("ReglaAlerta");

            entity.Property(e => e.Nombre)
                .HasMaxLength(100);

            entity.Property(e => e.ValorMin)
                .HasColumnType("decimal(10, 2)");

            entity.Property(e => e.ValorMax)
                .HasColumnType("decimal(10, 2)");

            entity.Property(e => e.Mensaje)
                .HasMaxLength(500);

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);

            entity.HasOne(d => d.TipoSensor)
                .WithMany(p => p.ReglaAlertas)
                .HasForeignKey(d => d.TipoSensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReglaAlerta_TipoSensor");

            entity.HasOne(d => d.TipoFenomeno)
                .WithMany(p => p.ReglaAlertas)
                .HasForeignKey(d => d.TipoFenomenoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReglaAlerta_TipoFenomeno");

            entity.HasOne(d => d.NivelAlerta)
                .WithMany(p => p.ReglaAlertas)
                .HasForeignKey(d => d.NivelAlertaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_ReglaAlerta_NivelAlerta");
        });
        
        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId);

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.NombreUsuario)
                .IsUnique();

            entity.Property(e => e.NombreCompleto)
                .HasMaxLength(200);

            entity.Property(e => e.NombreUsuario)
                .HasMaxLength(50);

            entity.Property(e => e.PasswordHash)
                .HasMaxLength(255);

            entity.Property(e => e.UltimoAcceso)
                .HasColumnType("datetime2");

            entity.Property(e => e.Activo)
                .HasDefaultValue(true);

            entity.Property(e => e.FechaIng)
                .HasColumnType("datetime2")
                .HasDefaultValueSql("(getdate())");

            entity.Property(e => e.FechaAct)
                .HasColumnType("datetime2");

            entity.HasOne(d => d.Rol)
                .WithMany(p => p.Usuarios)
                .HasForeignKey(d => d.RolId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Usuario_Rol");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
