export enum Mensaje {
    REGISTRO_ESTUDIANTES_EXITOSO = 'Estudiantes cargados exitosamente',
    ERROR_CARGAR_ESTUDIANTES = 'Carga de estudiantes fallida. Verifica los datos e intenta nuevamente',
    REGISTRE_CAMPOS_OBLIGATORIOS = 'Completa los campos marcados como obligatorios (*)',
    ESTUDIANTE_ELIMINADO_CORRECTAMENTE = 'Estudiante eliminado correctamente',
    CONFIRMAR_ELIMINAR_ESTUDIANTE = '¿Está seguro de eliminar este estudiante?',
    CONFIRMAR_SALIR_SIN_GUARDAR = 'La información no ha sido guardada, ¿Desea salir?',
    REGISTRO_DOCENTES_EXITOSO = 'Docentes cargados exitosamente',
    ERROR_CARGAR_DOCENTESS = 'Carga de docentes fallida. Verifica los datos e intenta nuevamente',
    DOCENTE_ELIMINADO_CORRECTAMENTE = 'Docente eliminado correctamente',
    CONFIRMAR_ELIMINAR_DOCENTE = '¿Está seguro de eliminar este docente?',
    ACTUALIZACION_EXITOSA = 'El registro fue actualizado exitosamente',
    GUARDADO_EXITOSO = 'Los datos han sido guardados exitosamente',
}

export enum Aviso {
    CURSO_ELIMINADO_CORRECTAMENTE = 'Curso eliminado correctamente',
    EMPRESA_ELIMINADA_CORRECTAMENTE = 'Empresa eliminada correctamente',

    RESPUESTA_ELIMINADA_CORRECTAMENTE = 'Respuesta eliminada correctamente',
    RESPUESTA_GUARDADA_CORRECTAMENTE = 'Respuesta cargada correctamente',
    RESPUESTA_ACTUALIZADA_CORRECTAMENTE = 'Respuesta actualizada correctamente',

    SOLICITUD_SIN_MODIFICAR = 'Selecciona modificar informacion (*)',
    SOLICITUD_ELIMINADA_CORRECTAMENTE = 'Solicitud eliminada correctamente',

    CREDENCIALES_INCORRECTAS = 'Credenciales incorrectas',
    CORREGIR_CAMPOS_OBLIGATORIOS = 'Con correciones pendientes',
    CAMPOS_COORDINADOR_PENDIENTE = 'Pendiente subir informacion de coordinador (*)',
    CAMPOS_DOCENTE_PENDIENTE = 'Pendiente subir informacion de docente (*)',

    CONFIRMAR_ELIMINAR_REGISTRO = '¿Está seguro de eliminar este registro?',
    ARCHIVO_ELIMINADO_CORRECTAMENTE = 'Archivo eliminado correctamente',
    ARCHIVO_DEMASIADO_GRANDE = 'El tamaño del archivo excede el límite máximo de 5 MB.',
}

export enum EstadoProceso {
    SIN_REGISTRAR_SOLICITUD_EXAMEN_DE_VALORACION = 'Sin registrar solicitud de examen de valoración por parte del docente',
    PENDIENTE_REVISION_COORDINADOR = 'Pendiente revision por parte del coordinador',
    DEVUELTO_EXAMEN_DE_VALORACION_POR_COORDINADOR = 'Se ha devuelto el examen de valoracion para correciones solicitadas del coordinador',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR = 'Pendiente cargue de informacion por parte del coordinador con respuesta de comite',
    DEVUELTO_EXAMEN_DE_VALORACION_POR_COMITE = 'Se ha devuelto el examen de valoracion para correciones realizadas por el comite',
    PENDIENTE_RESULTADO_EXAMEN_DE_VALORACION = 'Pendiente respuesta de examen de valoración por parte de los evaluadores',
    EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_1 = 'Se ha aprobado por un evaluador',
    EXAMEN_DE_VALORACION_APROBADO_EVALUADOR_2 = 'Se ha aprobado por los dos evaluadores. Sin registrar informacion por parte del docente para generacion de resolucion',
    EXAMEN_DE_VALORACION_NO_APROBADO_EVALUADOR_1 = 'Examen de valoración no aprobado por un evaluador',
    EXAMEN_DE_VALORACION_NO_APROBADO_EVALUADOR_2 = 'Examen de valoración no aprobado por ambos evaluadores',
    EXAMEN_DE_VALORACION_APLAZADO_EVALUADOR_1 = 'Examen de valoración aplazado por un evaluador',
    EXAMEN_DE_VALORACION_APLAZADO_EVALUADOR_2 = 'Examen de valoración aplazado por ambos evaluadores',
    EXAMEN_DE_VALORACION_APROBADO_Y_NO_APROBADO_EVALUADOR = 'Examen de valoracion aprobado de un evaluador y no aprobado por otro',
    EXAMEN_DE_VALORACION_APROBADO_Y_APLAZADO = 'Examen de valoracion aprobado de un evaluador y aplazado por otro',
    EXAMEN_DE_VALORACION_NO_APROBADO_Y_APLAZADO = 'Examen de valoracion no aprobado de un evaluador y aplazado por otro',
    EXAMEN_DE_VALORACION_CANCELADO = 'Examen de valoración cancelado debiado a que se recibieron 4 NO APROBADO por parte de los evaluadores',
    EXAMEN_DE_VALORACION_NO_ACTUALIZADO = 'El docente no ha cargado la informacion actualizada del examen de valoracion',
    EXAMEN_DE_VALORACION_ACTUALIZADO = 'Examen de valoracion actualizado, a la espera del coordinador',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_GENERACION_RESOLUCION = 'Pendiente verificacion archivos coordinador',
    DEVUELTO_GENERACION_DE_RESOLUCION_POR_COORDINADOR = 'Se ha solicitado correciones por parte del coordinador para continuar con el proceso de generacion de resolucion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_GENERACION_RESOLUCION = 'Pendiente registro de informacion por parte del coordinador con respuesta de comite',
    DEVUELTO_GENERACION_DE_RESOLUCION_POR_COMITE = 'Se ha solicitado correciones por parte del comite para continuar con el proceso de generacion de resolucion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_GENERACION_RESOLUCION = 'Pendiente registro de informacion por parte del coordinador con respuesta de consejo',
    PENDIENTE_SUBIDA_ARCHIVOS_DOCENTE_SUSTENTACION = 'Pendiente registro de informacion por parte del docente para sustentacion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE1_SUSTENTACION = 'Pendiente verificacion de archivos por parte del coordinador',
    DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COORDINADOR = 'Se ha solicitado correciones por parte del coordinador para continuar con el proceso de sustentacion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE2_SUSTENTACION = 'Pendiente registro de informacion por parte del coordinador para sustentacion para respuesta de consejo',
    DEVUELTO_SUSTENTACION_PARA_CORREGIR_AL_DOCENTE_COMITE = 'Se ha solicitado correciones por parte del comite para continuar con el proceso de sustentacion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE3_SUSTENTACION = 'Pendiente registro de informacion por parte del coordinador - Fase 3 para sustentacion',
    PENDIENTE_SUBIDA_ARCHIVOS_ESTUDIANTE_SUSTENTACION = 'Pendiente registro de informacion por parte del estudiante para sustentacion',
    PENDIENTE_SUBIDA_ARCHIVOS_COORDINADOR_FASE4_SUSTENTACION = 'Pendiente registro de informacion por parte del coordinador - Fase 4 para sustentacion',
    SUSTENTACION_APROBADA = 'Sustentación aprobada. Examen de valoración finalizado con éxito',
    SUSTENTACION_NO_APROBADA = 'Sustentación no aprobada. Examen de valoración finalizado.',
    SUSTENTACION_APLAZADA = 'Sustentación aplazada. Examen de valoración en espera',
    CANCELADO_TRABAJO_GRADO = 'El trabajo de grado ha sido cancelado de forma DEFINITIVA por el coordinador',
    EVALUADOR_NO_RESPONDIO = 'Evaluador del examen de valoracion no dio respuesta',
    SIN_ACTUALIZAR_FECHA_SUSTENTACION = 'No se ha reigstrado la fecha de sustentacion',
}

export enum EstadoEmpresa {
    LABORA_ACTUALMENTE = 'Labora actualmente en la empresa',
    CONTRATO_FINALIZADO = 'Contrato finalizado',
}

export enum Rol {
    TUTOR = 'Tutor',
    ASESOR = 'Asesor',
}

export enum TipoRol {
    INTERNO = 'Interno',
    EXTERNO = 'Externo',
}
