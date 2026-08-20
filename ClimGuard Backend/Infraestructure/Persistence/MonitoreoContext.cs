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

    public virtual DbSet<EstadoSensor> EstadoSensors { get; set; }

    public virtual DbSet<LecturaSensor> LecturaSensors { get; set; }

    public virtual DbSet<NivelAlerta> NivelAlerta { get; set; }

    public virtual DbSet<Notificacion> Notificacions { get; set; }

    public virtual DbSet<Rol> Rols { get; set; }

    public virtual DbSet<Sensor> Sensors { get; set; }

    public virtual DbSet<TipoFenomeno> TipoFenomenos { get; set; }

    public virtual DbSet<TipoSensor> TipoSensors { get; set; }

    public virtual DbSet<Umbral> Umbrals { get; set; }

    public virtual DbSet<Usuario> Usuarios { get; set; }

    protected override void OnConfiguring(DbContextOptionsBuilder optionsBuilder) { }

    protected override void OnModelCreating(ModelBuilder modelBuilder)
    {
        modelBuilder.Entity<Alerta>(entity =>
        {
            entity.HasKey(e => e.AlertaId).HasName("PK__Alerta__D9EF47C5336CC85A");

            entity.Property(e => e.Activa).HasDefaultValue(true);
            entity.Property(e => e.FechaHora)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.FechaResolucion).HasColumnType("datetime");
            entity.Property(e => e.Mensaje).HasMaxLength(300);

            entity.HasOne(d => d.Comunidad).WithMany(p => p.Alerta)
                .HasForeignKey(d => d.ComunidadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_Comunidad");

            entity.HasOne(d => d.NivelAlerta).WithMany(p => p.Alerta)
                .HasForeignKey(d => d.NivelAlertaId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_NivelAlerta");

            entity.HasOne(d => d.Sensor).WithMany(p => p.Alerta)
                .HasForeignKey(d => d.SensorId)
                .HasConstraintName("FK_Alerta_Sensor");

            entity.HasOne(d => d.TipoFenomeno).WithMany(p => p.Alerta)
                .HasForeignKey(d => d.TipoFenomenoId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Alerta_TipoFenomeno");
        });

        modelBuilder.Entity<Bitacora>(entity =>
        {
            entity.HasKey(e => e.BitacoraId).HasName("PK__Bitacora__7ACF9B3880F5B9C3");

            entity.ToTable("Bitacora");

            entity.Property(e => e.Accion).HasMaxLength(500);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())", "DF__Bitacora__FechaR__04E4BC85")
                .HasColumnType("datetime");

            entity.HasOne(d => d.Usuario).WithMany(p => p.Bitacoras)
                .HasForeignKey(d => d.UsuarioId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Bitacora_Usuario");
        });

        modelBuilder.Entity<Comunidad>(entity =>
        {
            entity.HasKey(e => e.ComunidadId).HasName("PK__Comunida__BE3D371B10DA9CE9");

            entity.ToTable("Comunidad");

            entity.Property(e => e.Descripcion).HasMaxLength(255);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Latitud).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Longitud).HasColumnType("decimal(9, 6)");
            entity.Property(e => e.Nombre).HasMaxLength(100);
        });

        modelBuilder.Entity<EstadoAlerta>(entity =>
        {
            entity.HasKey(e => e.EstadoAlertaId).HasName("PK__EstadoAl__C73CE723D9883744");

            entity.Property(e => e.Estado).HasMaxLength(50);
        });

        modelBuilder.Entity<EstadoSensor>(entity =>
        {
            entity.HasKey(e => e.EstadoSensorId).HasName("PK__EstadoSe__B78B942E257BBCCC");

            entity.ToTable("EstadoSensor");

            entity.Property(e => e.Estado).HasMaxLength(50);
        });

        modelBuilder.Entity<LecturaSensor>(entity =>
        {
            entity.HasKey(e => e.LecturaId).HasName("PK__LecturaS__B421D4FCF3B0D066");

            entity.ToTable("LecturaSensor");

            entity.Property(e => e.FechaHora)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Valor).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Sensor).WithMany(p => p.LecturaSensors)
                .HasForeignKey(d => d.SensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Lectura_Sensor");
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

            entity.Property(e => e.Descripcion).HasMaxLength(100);
            entity.Property(e => e.Rol1)
                .HasMaxLength(50)
                .HasColumnName("Rol");
        });

        modelBuilder.Entity<Sensor>(entity =>
        {
            entity.HasKey(e => e.SensorId).HasName("PK__Sensor__D8099BFA9158CE4B");

            entity.ToTable("Sensor");

            entity.Property(e => e.Activo).HasDefaultValue(true);
            entity.Property(e => e.FechaInstalacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.Nombre).HasMaxLength(100);
            entity.Property(e => e.UltimaActualizacion)
                .HasDefaultValueSql("(getdate())")
                .HasColumnType("datetime");
            entity.Property(e => e.ValorActual).HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.Comunidad).WithMany(p => p.Sensors)
                .HasForeignKey(d => d.ComunidadId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sensor_Comunidad");

            entity.HasOne(d => d.TipoSensor).WithMany(p => p.Sensors)
                .HasForeignKey(d => d.TipoSensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Sensor_TipoSensor");
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

        modelBuilder.Entity<Umbral>(entity =>
        {
            entity.HasKey(e => e.UmbralId).HasName("PK__Umbral__D40D8721BF012A8B");

            entity.ToTable("Umbral");

            entity.Property(e => e.ValorPrecaucion)
                .HasColumnType("decimal(10, 2)");

            entity.Property(e => e.ValorAlerta)
                .HasColumnType("decimal(10, 2)");

            entity.Property(e => e.ValorEmergencia)
                .HasColumnType("decimal(10, 2)");

            entity.HasOne(d => d.TipoSensor)
                .WithMany(p => p.Umbrals)
                .HasForeignKey(d => d.TipoSensorId)
                .OnDelete(DeleteBehavior.ClientSetNull)
                .HasConstraintName("FK_Umbral_TipoSensor");
        });

        modelBuilder.Entity<Usuario>(entity =>
        {
            entity.HasKey(e => e.UsuarioId).HasName("PK__Usuario__2B3DE7B81F2D97D9");

            entity.ToTable("Usuario");

            entity.HasIndex(e => e.NombreUsuario, "UQ__Usuario__6B0F5AE085D0F510").IsUnique();

            entity.Property(e => e.Activo).HasDefaultValue(true, "DF__Usuario__Activo__6B24EA82");
            entity.Property(e => e.Apellido1).HasMaxLength(100);
            entity.Property(e => e.Apellido2).HasMaxLength(100);
            entity.Property(e => e.FechaRegistro)
                .HasDefaultValueSql("(getdate())", "DF__Usuario__FechaRe__6C190EBB")
                .HasColumnType("datetime");
            entity.Property(e => e.Nombre1).HasMaxLength(100);
            entity.Property(e => e.Nombre2).HasMaxLength(100);
            entity.Property(e => e.NombreUsuario).HasMaxLength(50);
            entity.Property(e => e.PasswordHash).HasMaxLength(255);
            entity.Property(e => e.Rol)
                .HasMaxLength(20)
                .HasDefaultValue("Administrador", "DF__Usuario__Rol__6A30C649");
        });

        OnModelCreatingPartial(modelBuilder);
    }

    partial void OnModelCreatingPartial(ModelBuilder modelBuilder);
}
