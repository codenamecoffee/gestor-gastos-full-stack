import { Component, Input, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent implements OnInit{
  @Input() title: string = 'Widget';
  @Input() minWidth: number = 200;
  @Input() minHeight: number = 200;
  //@Input() initialWidth: number = 300;
  //@Input() initialHeight: number = 200;
  @Input() initialX: number = 100;
  @Input() initialY: number = 100;

  // Definite assignment assertion: '!' (En position! y size!)
  // => Le aseguramos a Angular/TS, que las propiedades serán inicializadas
  // antes de utilizarse.
  position!: { x: number; y: number };
  size!: { width: number; height: number };

  ngOnInit() {
    this.size = { width: this.minWidth, height: this.minHeight };
    this.position = { x: this.initialX, y: this.initialY };
  }

  private isDragging = false;
  private isResizing = false;
  private resizeDirection: string | null = null;
  private startWidth = 0;
  private startHeight = 0;
  private startMouseX = 0;  // Punto en donde se hizo el mousedown.
  private startMouseY = 0;
  private startLeft = 0;  // Offset del widget en la pantalla.
  private startTop = 0;
  private dragOffset = { x: 0, y: 0 };

  get bodyHeight(): number {
    const headerHeight = 36;
    return this.size.height - headerHeight;
  }

  // Dragging:
  startDrag(event: MouseEvent) {
    if (!(event.target as HTMLElement).classList.contains('widget-header')) return;

    this.isDragging = true;

    // Calcula el offset entre el mouse y la esquina del widget
    this.dragOffset.x = event.clientX - this.position.x;
    this.dragOffset.y = event.clientY - this.position.y;

    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  // Dragging:
  onDrag = (event: MouseEvent) => {  
    if (!this.isDragging) return;

    // Calculamos la nueva posición del mouse pero aplicando el dragOffset
    const newX = event.clientX - this.dragOffset.x;
    const newY = event.clientY - this.dragOffset.y;

    // Límites: El máximo X e Y que pueden alcanzar el borde izq y el borde sup del widget
    const maxX = window.innerWidth - this.size.width;
    const maxY = window.innerHeight - this.size.height;

    // max entre 0 y ... para que no se vaya por el borde izquierdo o superior
    // min entre newX y maxX ... para que no se vaya por el borde derecho o inferior
    this.position.x = Math.max(0, Math.min(newX, maxX));
    this.position.y = Math.max(0, Math.min(newY, maxY));
  }

  // Dragging:
  stopDrag = () => {
    this.isDragging = false;
    document.removeEventListener('mousemove', this.onDrag);
    document.removeEventListener('mouseup', this.stopDrag);
  }


  // Resizing:
  startResize(event: MouseEvent, direction: string) {
    this.isResizing = true;
    this.resizeDirection = direction; // necesitamos guardar qué handle se tocó
    this.startMouseX = event.clientX;
    this.startMouseY = event.clientY;
    this.startWidth = this.size.width;
    this.startHeight = this.size.height;
    this.startLeft = this.position.x;
    this.startTop = this.position.y;

    document.addEventListener('mousemove', this.onResize);
    document.addEventListener('mouseup', this.stopResize);

    event.preventDefault();
  };

  // Resizing:
  onResize = (event: MouseEvent) => {
    if (!this.isResizing || !this.resizeDirection) return; 
    let dx = event.clientX - this.startMouseX;
    let dy = event.clientY - this.startMouseY;

    let newWidth = this.startWidth;
    let newHeight = this.startHeight;
    let newLeft = this.startLeft;
    let newTop = this.startTop;

    switch (this.resizeDirection) {
      case 'right':
        newWidth = Math.max(this.minWidth, this.startWidth + dx);
        break;

      case 'bottom':
        newHeight = Math.max(this.minHeight, this.startHeight + dy);
        break;

      case 'left': {
        const proposedWidth = this.startWidth - dx;
        if (proposedWidth >= this.minWidth) {
          newWidth = proposedWidth;
          newLeft = this.startLeft + dx;
        } else {
          dx = this.startWidth - this.minWidth;
          newWidth = this.minWidth;
          newLeft = this.startLeft + dx;
        }
        break;
      }

      case 'top': {
        const proposedHeight = this.startHeight - dy;
        if (proposedHeight >= this.minHeight) {
          newHeight = proposedHeight;
          newTop = this.startTop + dy;
        } else {
          dy = this.startHeight - this.minHeight;
          newHeight = this.minHeight;
          newTop = this.startTop + dy;
        }
        break;
      }

      case 'top-left': {
        const proposedWidth = this.startWidth - dx;
        const proposedHeight = this.startHeight - dy;

        if (proposedWidth >= this.minWidth) {
          newWidth = proposedWidth;
          newLeft = this.startLeft + dx;
        } else {
          dx = this.startWidth - this.minWidth;
          newWidth = this.minWidth;
          newLeft = this.startLeft + dx;
        }

        if (proposedHeight >= this.minHeight) {
          newHeight = proposedHeight;
          newTop = this.startTop + dy;
        } else {
          dy = this.startHeight - this.minHeight;
          newHeight = this.minHeight;
          newTop = this.startTop + dy;
        }
        break;
      }

      case 'top-right': {
        const proposedHeight = this.startHeight - dy;
        newWidth = Math.max(this.minWidth, this.startWidth + dx);

        if (proposedHeight >= this.minHeight) {
          newHeight = proposedHeight;
          newTop = this.startTop + dy;
        } else {
          dy = this.startHeight - this.minHeight;
          newHeight = this.minHeight;
          newTop = this.startTop + dy;
        }
        break;
      }

      case 'bottom-left': {
        const proposedWidth = this.startWidth - dx;
        newHeight = Math.max(this.minHeight, this.startHeight + dy);

        if (proposedWidth >= this.minWidth) {
          newWidth = proposedWidth;
          newLeft = this.startLeft + dx;
        } else {
          dx = this.startWidth - this.minWidth;
          newWidth = this.minWidth;
          newLeft = this.startLeft + dx;
        }
        break;
      }

      case 'bottom-right':
        newWidth = Math.max(this.minWidth, this.startWidth + dx);
        newHeight = Math.max(this.minHeight, this.startHeight + dy);
        break;
    }

    // Evitamos que se salga del viewport (Igual que en onDrag)
    const maxWidth = window.innerWidth - newLeft;
    const maxHeight = window.innerHeight - newTop;

    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    // Límites para izquierda y arriba del navegador:

    if (newLeft < 0) { // Si fuesemos a tener un x < 0
      newWidth += newLeft;  // Frena en el borde izquierdo. (Pensar que se ejecuta en cada pixel).
      newLeft = 0;  // Reubicamos el borde izquierdo.
    }

    if (newTop < 0) {  // Si fuesemos a tener un y < 0
      newHeight += newTop;  // Frena en el borde superior.
      newTop = 0;  // Reubicamos el borde superior.
    }

    /* Ni el width ni el height llegan a crecer fuera del borde izq o sup debido a
    los propios x e y que como toman valores negativos, detienen su crecimiento frenando
    exactamente a los width y height en los bordes izquierdo y superior respectivamente. */

    // Evitar que el ancho/alto se vuelvan negativos
    newWidth = Math.max(newWidth, this.minWidth);
    newHeight = Math.max(newHeight, this.minHeight);

    // Aplicamos los cambios finales
    this.size.width = newWidth;
    this.size.height = newHeight;
    this.position.x = newLeft;
    this.position.y = newTop;
  };

  // Resizing:
  stopResize = () => {
    this.isResizing = false;
    this.resizeDirection = null;
    document.removeEventListener('mousemove', this.onResize);
    document.removeEventListener('mouseup', this.stopResize);
  };
  
}
