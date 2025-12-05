import { Component, OnInit, ViewChild, ElementRef,  Input } from '@angular/core';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { DomSanitizer, SafeResourceUrl } from '@angular/platform-browser';
import { Subject } from 'rxjs';
import { debounceTime, switchMap } from 'rxjs/operators';
import { TransaccionService, Transaccion, FiltrosTransaccion } from '../services/transaccion.service';
import { WidgetComponent } from '../shared/widget/widget.component';
import { TransaccionesActionsComponent } from './components/transacciones-actions/transacciones-actions.component';
import { TransaccionesFiltrosComponent } from './components/transacciones-filtros/transacciones-filtros.component';
import { TransaccionCardComponent } from './components/transaccion-card/transaccion-card.component';
import { TransaccionFormComponent } from './components/transaccion-form/transaccion-form.component';


@Component({
  selector: 'app-transacciones-widget',
  standalone: true,
  imports: [CommonModule, FormsModule, WidgetComponent, TransaccionesActionsComponent, TransaccionesFiltrosComponent, TransaccionCardComponent, TransaccionFormComponent], 
  templateUrl: './transacciones-widget.component.html',
  styleUrl: './transacciones-widget.component.scss'
})

export class TransaccionesWidgetComponent implements OnInit {

  // Para poder referenciar el contenedor de las cards y controlar el scroll.
  // En transacciones-container se agregó el atributo #contenedorTransacciones 
  @ViewChild('contenedorTransacciones', { static: false })
  contenedorTransacciones!: ElementRef;

  @Input() bodyHeight!: number;

  transacciones: Transaccion[] = []; // arreglo para guardar lo que venga de la API
  mostrarFormulario: boolean = false;
  usarFechaPersonalizada: boolean = false;
  agregarComprobante: boolean = false;
  editingId: number | null = null;
  tieneComprobanteExistente: boolean = false;
  eliminarComprobante: boolean = false;
  mostrarComprobante: boolean = false;
  comprobanteUrl: SafeResourceUrl | null = null;
  comprobanteSobreFormulario: boolean = false;
  tipoComprobante: 'pdf' | 'imagen' | 'texto' | null = null;
  contenidoTexto: string | null = null;
  mostrarBuscador: boolean = false;
  isProcessing: boolean = false;

  // Subject para manejar búsquedas en tiempo real con debounce
  // Recibe filtros y automáticamente ejecuta la búsqueda con delay para evitar spam al backend
  private searchSubject = new Subject<Partial<FiltrosTransaccion>>();

  nuevaTransaccion = {
    fecha: '', // Vacío por defecto. Solo se completa si el usuario marca la opción.
    descripcion: '',
    monto: 0,
    moneda: '',
    categoria: '',
    tipo: '',
    comprobante: null as File | null,
  };

  /* Cuando el proyecto crezca, podrías mover esos arrays (categorias y tiposTransaccion) a
     un archivo constants.ts o enums.ts para mantener el componente más limpio. */

  categorias: string[] = [
    'Alquiler',
    'Boletos',
    'Peluquería',
    'Gimnasio',
    'Streaming',
    'Saldo',
    'Consumibles',
    'Pareja',
    'Imprevistos'
  ];

  tiposTransaccion: string[] = ['Ingreso', 'Gasto'];

  filtros: FiltrosTransaccion = {
    descripcion: '',
    tipo: '',
    categoria: '',
    desde: '',
    hasta: '',
    mimeType: ''
  };

  constructor(
    private transaccionService: TransaccionService,
    private sanitizer: DomSanitizer
  ) { }

  ngOnInit(): void {
    this.cargarTransacciones();

    this.searchSubject.pipe(
      debounceTime(500),
      switchMap(filtros => this.transaccionService.filtrar(filtros))
    ).subscribe({
      next: data => {
        this.transacciones = data;
        setTimeout(() => this.scrollToTop(), 100); // Delay para que el DOM se actualice
      },
      error: err => console.error('Error en búsqueda en tiempo real', err)
    });
  }

  private scrollToTop(): void {  // Apunta al div transacciones-container
    if (this.contenedorTransacciones?.nativeElement) {
      this.contenedorTransacciones.nativeElement.scrollTo({
        top: 0,
        behavior: 'smooth'
      });
    }
  } // Para mi este método no funciona bien. Pero bueno.

  cargarTransacciones(): void {
    this.transaccionService.obtenerTodas().subscribe(data => {
      this.transacciones = data;
      setTimeout(() => this.scrollToTop(), 100);
    });
  }

  showForm(): void {
    // Limpiamos por las dudas, luego mostramos.
    this.resetearFormulario();
    this.mostrarFormulario = true;
  }

  resetearFormulario(): void {
    this.agregarComprobante = false;
    this.usarFechaPersonalizada = false;
    this.nuevaTransaccion = {
      fecha: '',
      descripcion: '',
      monto: 0,
      moneda: '',
      categoria: '',
      tipo: '',
      comprobante: null,
    };
  }

  onFileSelected(event: Event): void {
    const input = event.target as HTMLInputElement;
    if (input.files && input.files.length > 0 && this.agregarComprobante) {
      this.nuevaTransaccion.comprobante = input.files[0];
    } else {
      this.nuevaTransaccion.comprobante = null;
    }
  }

  cancelarCreacion(): void {
    this.editingId = null;
    this.mostrarFormulario = false;
    this.resetearFormulario();
  }

  crearTransaccion(): void {
    const formData = new FormData();

    // Recorremos todas las claves de nuevaTransaccion
    for (const key in this.nuevaTransaccion) {
      if (key === 'fecha' && !this.usarFechaPersonalizada) continue; // No agregamos fecha si no se usa.
      if (key === 'comprobante' && this.nuevaTransaccion.comprobante && this.agregarComprobante) {  // Agregamos comprobante si se subió.
        formData.append('comprobante', this.nuevaTransaccion.comprobante);
      } else if (key !== 'comprobante') {
        formData.append(key, (this.nuevaTransaccion as any)[key]);
      }
    }

    this.transaccionService.crear(formData).subscribe({
      next: () => {
        this.mostrarFormulario = false;
        this.cargarTransacciones();
        this.resetearFormulario();
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error al crear transacción:', err);

        if (err.error && typeof err.error === 'string') {
          alert(err.error);
        } else if (err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat();
          alert(mensajes.join('\n'));
        } else {
          alert('No se pudo crear la transacción. Verifique los campos.');
        }
      }
    });
  }

  editarTransaccion(transaccion: Transaccion): void {
    this.mostrarFormulario = true;

    // Convertir la fecha UTC del backend a formato local compatible con datetime-local
    const fechaUtc = new Date(transaccion.fecha);
    const fechaLocal = new Date(fechaUtc.getTime() - fechaUtc.getTimezoneOffset() * 60000);
    const fechaFormateada = fechaLocal.toISOString().slice(0, 16); // yyyy-MM-ddTHH:mm

    // Cargar datos en el formulario actual:
    this.nuevaTransaccion = {
      fecha: fechaFormateada, // Para poder renderizarse bien en el input.
      descripcion: transaccion.descripcion,
      monto: transaccion.monto,
      moneda: transaccion.moneda,
      categoria: transaccion.categoria,
      tipo: transaccion.tipo,
      comprobante: null, // no editamos comprobante todavía
    };

    // Guardamos id para saber qué transacción estamos editando
    this.editingId = transaccion.id;
    this.tieneComprobanteExistente = !!transaccion.comprobante; // Conversión: string/null
                                                                // => (!) = false/true => (!!) = true/false
    this.eliminarComprobante = false;
  }

  guardarCambios(): void {
    if (!this.editingId) return; // seguridad

    const formData = new FormData();
    for (const key in this.nuevaTransaccion) {
      if (key === 'fecha' && !this.usarFechaPersonalizada) continue;
      if (key === 'comprobante' && this.nuevaTransaccion.comprobante) {
        formData.append('ComprobanteInput', this.nuevaTransaccion.comprobante);
      } else if (key !== 'comprobante') {
        formData.append(key, (this.nuevaTransaccion as any)[key]);
      }
    }

    // Lógica del comprobante
    if (this.eliminarComprobante) {
      formData.append('ActualizarComprobante', 'true');
    } else if (this.nuevaTransaccion.comprobante) {
      // Si se sube uno nuevo, también hay que actualizar
      formData.append('ActualizarComprobante', 'true');
    } else {
      formData.append('ActualizarComprobante', 'false');
    }

    //if (!this.usarFechaPersonalizada) {
    //  formData.delete('fecha');
    //}

    this.transaccionService.actualizar(this.editingId, formData).subscribe({
      next: () => {
        this.cargarTransacciones();
        this.mostrarFormulario = false;
        this.editingId = null;
        this.tieneComprobanteExistente = false;
        this.eliminarComprobante = false;
        this.resetearFormulario();
        this.isProcessing = false;
      },
      error: (err) => {
        this.isProcessing = false;
        console.error('Error al actualizar:', err);

        if (err.error && typeof err.error === 'string') {
          alert(err.error);
        } else if (err.error?.errors) {
          const mensajes = Object.values(err.error.errors).flat();
          alert(mensajes.join('\n'));
        } else {
          alert('No se pudo actualizar la transacción. Verifique los campos.');
        }
      }
    });
  }

  onSubmit() {
    if (this.isProcessing) return;
    this.isProcessing = true;

    if (this.editingId) {
      this.guardarCambios();
    } else {
      this.crearTransaccion();
    }

    // Se resetea en los callbacks de success/error de cada método
  }

  eliminarTransaccion(id: number): void {
    if (confirm('¿Seguro desea eliminar esta transacción?')) {
      this.transaccionService.eliminar(id).subscribe(() => {
        this.cargarTransacciones();
      });
    }
  }

  verComprobante(id: number, desdeFormulario: boolean = false): void {
    this.transaccionService.obtenerComprobante(id).subscribe(blob => {
      // 1. Detectar tipo de archivo por el MIME type
      this.detectarTipoArchivo(blob);

      // 2. Si es texto, extraer contenido
      if (this.tipoComprobante === 'texto') {
        this.extraerTexto(blob);
      } else {
        // 3. Para PDF/imágenes crear URL como antes
        const url = URL.createObjectURL(blob);
        this.comprobanteUrl = this.sanitizer.bypassSecurityTrustResourceUrl(url);
      }

      this.mostrarComprobante = true;
      this.comprobanteSobreFormulario = desdeFormulario;
    });
  }

  private detectarTipoArchivo(blob: Blob): void {
    if (blob.type.includes('pdf')) {
      this.tipoComprobante = 'pdf';
    } else if (blob.type.includes('image')) {
      this.tipoComprobante = 'imagen';
    } else if (blob.type.includes('text')) {
      this.tipoComprobante = 'texto';
    } else {
      this.tipoComprobante = null;
    }
  }

  private extraerTexto(blob: Blob): void {
    // 1. Crear una instancia del lector
    const reader = new FileReader();

    // 2. Definir qué hacer CUANDO termine de leer (callback)
    reader.onload = (event) => { 
      // event.target es el FileReader mismo
      // event.target.result contiene el contenido leído
      this.contenidoTexto = event.target?.result as string;
    };

    // 3. INICIAR la lectura (asíncrona)
    reader.readAsText(blob);
    // El método termina aquí, pero el callback se ejecutará después
  }

  esPDF(): boolean {
    return this.tipoComprobante === 'pdf';
  }

  esImagen(): boolean {
    return this.tipoComprobante === 'imagen';
  }

  esTexto(): boolean {
    return this.tipoComprobante === 'texto';
  }

  cerrarComprobante(): void {
    this.mostrarComprobante = false;
    this.comprobanteUrl = null;
    this.comprobanteSobreFormulario = false;
  }

  limpiar(): void {
    this.filtros = {
      descripcion: '',
      tipo: '',
      categoria: '',
      desde: '',
      hasta: '',
      mimeType: ''
    };
    this.cargarTransacciones(); // vuelve al listado completo
  }

  showBuscador(): void {
    if (!this.mostrarBuscador && !this.mostrarFormulario && !this.mostrarComprobante) {
      this.mostrarBuscador = true;
    }
  }

  cerrarBuscador(): void {
    this.mostrarBuscador = false;
    this.limpiar();
  }

  onFiltroChange(): void {
    const filtrosLimpiados: Partial<FiltrosTransaccion> = {};
    (Object.keys(this.filtros) as Array<keyof FiltrosTransaccion>).forEach(key => {
      if (this.filtros[key]) filtrosLimpiados[key] = this.filtros[key];
    });
    this.searchSubject.next(filtrosLimpiados);
  }

}
