-- Habilitar extensión para generación de UUID en PostgreSQL
CREATE EXTENSION IF NOT EXISTS "uuid-ossp";

-- 1. SUPER ADMINISTRADORES (Administradores del sistema)
CREATE TABLE IF NOT EXISTS super_administradores (
    super_admin_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);


-- 2. EMPRESAS (Tenants - Permite escalar el sistema a otros negocios a futuro)
CREATE TABLE IF NOT EXISTS empresas (
    empresa_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(100) NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 3. ROLES
CREATE TABLE IF NOT EXISTS roles (
    rol_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    nombre VARCHAR(50) NOT NULL UNIQUE,
    descripcion TEXT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 4. USUARIOS
CREATE TABLE IF NOT EXISTS usuarios (
    usuario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    rol_id UUID NOT NULL REFERENCES roles(rol_id),
    nombre VARCHAR(100) NOT NULL,
    correo VARCHAR(100) NOT NULL UNIQUE,
    contrasena_hash VARCHAR(255) NOT NULL,
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 5. UBICACIONES (Soporte para Puestos de Contingencia, Cámara de Frío, etc.)
CREATE TABLE IF NOT EXISTS ubicaciones (
    ubicacion_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    nombre VARCHAR(100) NOT NULL,
    tipo VARCHAR(50) NOT NULL CHECK (tipo IN ('Acopio', 'Camara Frio', 'Puesto Principal', 'Puesto Contingencia')),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 6. ACOPIOS (Lotes provenientes de provincia)
CREATE TABLE IF NOT EXISTS acopios (
    acopio_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    encargado_lote VARCHAR(100) NOT NULL, 
    fecha_compra DATE NOT NULL, 
    fecha_llegada DATE NULL, 
    origen VARCHAR(100) NOT NULL, 
    flete_costo NUMERIC(10,2) NOT NULL DEFAULT 0.00, 
    estado VARCHAR(50) NOT NULL DEFAULT 'En Transito' CHECK (estado IN ('En Transito', 'Recibido', 'Liquidado')),
    creado_por_usuario_id UUID NOT NULL REFERENCES usuarios(usuario_id), 
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 7. JABAS (Clasificación de 4 tipos y 6 categorías con códigos de color)
CREATE TABLE IF NOT EXISTS jabas (
    jaba_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    acopio_id UUID NOT NULL REFERENCES acopios(acopio_id) ON DELETE CASCADE,
    ubicacion_id UUID NULL REFERENCES ubicaciones(ubicacion_id) ON DELETE SET NULL,
    tipo_palta VARCHAR(50) NOT NULL CHECK (tipo_palta IN ('Fuerte', 'Hass', 'Naval', 'Villacampa')),
    categoria VARCHAR(50) NOT NULL,
    codigo_color VARCHAR(50) NOT NULL,
    cantidad_jabas INT NOT NULL DEFAULT 1 CHECK (cantidad_jabas > 0), 
    peso_bruto NUMERIC(10,2) NOT NULL CHECK (peso_bruto > 0), 
    peso_actual NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (peso_actual >= 0),
    estado VARCHAR(50) NOT NULL DEFAULT 'Almacenada' CHECK (estado IN ('Almacenada', 'En Transito', 'Convertida_Kilos', 'Descartada')),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    
    -- Validaciones estrictas de clasificación de palta según requerimiento
    CONSTRAINT chk_jabas_tipo_categoria CHECK (
        (tipo_palta = 'Fuerte' AND categoria IN ('1era', '2da', '3era', '4ta', 'Semimanchada', 'Manchada')) OR
        (tipo_palta = 'Hass' AND categoria IN ('1era', '2da', '3era', '4ta', 'Manchada')) OR
        (tipo_palta = 'Naval' AND categoria IN ('Limpia', 'Manchada')) OR
        (tipo_palta = 'Villacampa' AND categoria IN ('1era', 'Manchada'))
    )
);

-- 8. INVENTARIOS KILOS (Transformación y Merma)
CREATE TABLE IF NOT EXISTS inventarios_kilos (
    inventario_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    ubicacion_id UUID NOT NULL REFERENCES ubicaciones(ubicacion_id) ON DELETE CASCADE,
    tipo_palta VARCHAR(50) NOT NULL CHECK (tipo_palta IN ('Fuerte', 'Hass', 'Naval', 'Villacampa')),
    categoria VARCHAR(50) NOT NULL,
    kilos_disponibles NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (kilos_disponibles >= 0),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT uq_inventario_ubicacion_palta UNIQUE (ubicacion_id, tipo_palta, categoria)
);

-- 9. VENTAS (Registro estricto por kilos)
CREATE TABLE IF NOT EXISTS ventas (
    venta_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    ubicacion_id UUID NULL REFERENCES ubicaciones(ubicacion_id),
    vendedor_usuario_id UUID NOT NULL REFERENCES usuarios(usuario_id), 
    fecha_venta TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    monto_total NUMERIC(10,2) NOT NULL DEFAULT 0.00 CHECK (monto_total >= 0),
    metodo_pago VARCHAR(50) NOT NULL DEFAULT 'Efectivo',
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 10. DETALLES VENTA
CREATE TABLE IF NOT EXISTS detalles_venta (
    detalle_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    venta_id UUID NOT NULL REFERENCES ventas(venta_id) ON DELETE CASCADE,
    tipo_palta VARCHAR(50) NOT NULL CHECK (tipo_palta IN ('Fuerte', 'Hass', 'Naval', 'Villacampa')),
    categoria VARCHAR(50) NOT NULL,
    kilos_vendidos NUMERIC(10,2) NOT NULL CHECK (kilos_vendidos > 0),
    precio_unitario NUMERIC(10,2) NOT NULL CHECK (precio_unitario > 0),
    subtotal NUMERIC(10,2) NOT NULL CHECK (subtotal >= 0),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 11. GASTOS OPERATIVOS (Estibadores, Transportistas)
CREATE TABLE IF NOT EXISTS gastos_operativos (
    gasto_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    acopio_id UUID NULL REFERENCES acopios(acopio_id) ON DELETE CASCADE,
    nombre_receptor VARCHAR(100) NOT NULL, 
    tipo_gasto VARCHAR(50) NOT NULL CHECK (tipo_gasto IN ('Estibador', 'Cargador', 'Transporte', 'Seleccionador')),
    concepto VARCHAR(255) NOT NULL, 
    cantidad_jabas INT NULL CHECK (cantidad_jabas >= 0),
    tarifa_por_jaba NUMERIC(10,2) NULL CHECK (tarifa_por_jaba >= 0),
    monto_total NUMERIC(10,2) NOT NULL CHECK (monto_total > 0), 
    usuario_registro_id UUID NOT NULL REFERENCES usuarios(usuario_id), 
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- 12. FIADOS (Deudores)
CREATE TABLE IF NOT EXISTS fiados (
    fiado_id UUID PRIMARY KEY DEFAULT uuid_generate_v4(),
    empresa_id UUID NOT NULL REFERENCES empresas(empresa_id) ON DELETE CASCADE,
    nombre_deudor VARCHAR(100) NOT NULL, 
    motivo_deuda VARCHAR(255) NOT NULL, 
    monto_deuda NUMERIC(10,2) NOT NULL CHECK (monto_deuda > 0), 
    fecha_advertencia DATE NOT NULL, 
    estado VARCHAR(50) NOT NULL DEFAULT 'Pendiente' CHECK (estado IN ('Pendiente', 'Pagado', 'Vencido')), 
    creado_por_usuario_id UUID NOT NULL REFERENCES usuarios(usuario_id),
    fecha_creacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_actualizacion TIMESTAMP WITHOUT TIME ZONE NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- ============================================================================
-- 13. DATOS INICIALES PREDETERMINADOS (SEED DATA)
-- ============================================================================

DO $$
DECLARE
    v_empresa_id UUID;
    v_rol_admin_id UUID;
    v_rol_vendedor_id UUID;
BEGIN
    -- 1. Inserción de la Empresa Principal (JOSBECORSA S.A.C.)
    SELECT empresa_id INTO v_empresa_id 
    FROM empresas 
    WHERE nombre = 'JOSBECORSA S.A.C.' 
    LIMIT 1;

    IF v_empresa_id IS NULL THEN
        INSERT INTO empresas (nombre)
        VALUES ('JOSBECORSA S.A.C.')
        RETURNING empresa_id INTO v_empresa_id;
    END IF;

    -- 2. Inserción de Roles del Sistema
    SELECT rol_id INTO v_rol_admin_id 
    FROM roles 
    WHERE nombre = 'Administrador' 
    LIMIT 1;

    IF v_rol_admin_id IS NULL THEN
        INSERT INTO roles (nombre, descripcion)
        VALUES ('Administrador', 'Acceso a gestion operativa')
        RETURNING rol_id INTO v_rol_admin_id;
    ELSE
        UPDATE roles 
        SET descripcion = 'Acceso a gestion operativa' 
        WHERE rol_id = v_rol_admin_id;
    END IF;

    SELECT rol_id INTO v_rol_vendedor_id 
    FROM roles 
    WHERE nombre = 'Vendedor de puesto' 
    LIMIT 1;

    IF v_rol_vendedor_id IS NULL THEN
        INSERT INTO roles (nombre, descripcion)
        VALUES ('Vendedor de puesto', 'Acceso al módulo de ventas')
        RETURNING rol_id INTO v_rol_vendedor_id;
    ELSE
        UPDATE roles 
        SET descripcion = 'Acceso al módulo de ventas' 
        WHERE rol_id = v_rol_vendedor_id;
    END IF;

    -- 3. Inserción de Usuario Inicial (Yolanda Salvatierra) vinculado a JOSBECORSA S.A.C. y Rol Administrador
    -- Contraseña hasheada con bcryptjs: yolanda123
    IF NOT EXISTS (SELECT 1 FROM usuarios WHERE correo = 'yolanda@gmail.com') THEN
        INSERT INTO usuarios (empresa_id, rol_id, nombre, correo, contrasena_hash)
        VALUES (
            v_empresa_id,
            v_rol_admin_id,
            'Yolanda Salvatierra',
            'yolanda@gmail.com',
            '$2b$10$d6MKyoARBebf6NeQC2Nm2.7hbwXtzIi0fwUq54eoB2S32I5P4SHcm'
        );
    ELSE
        UPDATE usuarios
        SET empresa_id = v_empresa_id,
            rol_id = v_rol_admin_id,
            nombre = 'Yolanda Salvatierra',
            contrasena_hash = '$2b$10$d6MKyoARBebf6NeQC2Nm2.7hbwXtzIi0fwUq54eoB2S32I5P4SHcm'
        WHERE correo = 'yolanda@gmail.com';
    END IF;

    -- 4. Inserción de Ubicaciones Iniciales vinculadas a JOSBECORSA S.A.C.
    IF NOT EXISTS (SELECT 1 FROM ubicaciones WHERE empresa_id = v_empresa_id AND nombre = 'Puesto Principal') THEN
        INSERT INTO ubicaciones (empresa_id, nombre, tipo)
        VALUES (v_empresa_id, 'Puesto Principal', 'Puesto Principal');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM ubicaciones WHERE empresa_id = v_empresa_id AND nombre = 'Puesto Contingencia') THEN
        INSERT INTO ubicaciones (empresa_id, nombre, tipo)
        VALUES (v_empresa_id, 'Puesto Contingencia', 'Puesto Contingencia');
    END IF;

    IF NOT EXISTS (SELECT 1 FROM ubicaciones WHERE empresa_id = v_empresa_id AND nombre = 'Cámara de Frío') THEN
        INSERT INTO ubicaciones (empresa_id, nombre, tipo)
        VALUES (v_empresa_id, 'Cámara de Frío', 'Camara Frio');
    END IF;
END $$;



