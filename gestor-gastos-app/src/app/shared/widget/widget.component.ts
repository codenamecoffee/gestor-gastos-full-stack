import { Component, Input, OnInit, OnDestroy } from '@angular/core';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-widget',
  standalone: true,
  imports: [CommonModule],
  templateUrl: './widget.component.html',
  styleUrl: './widget.component.scss'
})
export class WidgetComponent implements OnInit, OnDestroy {
  @Input() title: string = 'Widget';
  @Input() minWidth: number = 200;
  @Input() minHeight: number = 200;
  //@Input() initialWidth: number = 300;
  //@Input() initialHeight: number = 200;
  @Input() initialX: number = 100;
  @Input() initialY: number = 100;

  // Definite assignment assertion: '!' (In position! and size!)
  // => We assure Angular/TS that the properties will be initialized before being used.
  position!: { x: number; y: number };
  size!: { width: number; height: number };

  ngOnInit() {
    this.size = { width: this.minWidth, height: this.minHeight };
    this.position = { x: this.initialX, y: this.initialY };

    window.addEventListener('resize', this.onWindowResize);
  }

  ngOnDestroy(): void {
    window.removeEventListener('resize', this.onWindowResize);
  }

  private isDragging = false;
  private isResizing = false;
  private resizeDirection: string | null = null;
  private startWidth = 0;
  private startHeight = 0;
  private startMouseX = 0;  // Point where mousedown occurred.
  private startMouseY = 0;
  private startLeft = 0;  // Widget offset on the screen.
  private startTop = 0;
  private dragOffset = { x: 0, y: 0 };

  get bodyHeight(): number {
    const headerHeight = 36;
    return this.size.height - headerHeight;
  }

  onWindowResize = () => {
  const margin = 16; // px
  const maxWidth = Math.max(window.innerWidth - margin, this.minWidth);
  const maxHeight = Math.max(window.innerHeight - margin, this.minHeight);

  // Adjust size if it's too large
  this.size.width = Math.min(this.size.width, maxWidth);
  this.size.height = Math.min(this.size.height, maxHeight);

  // Adjust position if it's out of bounds
  const maxX = window.innerWidth - this.size.width;
  const maxY = window.innerHeight - this.size.height;
  this.position.x = Math.max(0, Math.min(this.position.x, maxX));
  this.position.y = Math.max(0, Math.min(this.position.y, maxY));
};

  // Dragging:
  startDrag(event: MouseEvent) {
    if (!(event.target as HTMLElement).classList.contains('widget-header')) return;

    this.isDragging = true;

    // Calculate the offset between the mouse and the widget's corner
    this.dragOffset.x = event.clientX - this.position.x;
    this.dragOffset.y = event.clientY - this.position.y;

    document.addEventListener('mousemove', this.onDrag);
    document.addEventListener('mouseup', this.stopDrag);
  }

  // Dragging:
  onDrag = (event: MouseEvent) => {  
    if (!this.isDragging) return;

    // Calculate the new mouse position applying the dragOffset
    const newX = event.clientX - this.dragOffset.x;
    const newY = event.clientY - this.dragOffset.y;

    // Limits: The maximum X and Y that the left/top edge of the widget can reach
    const maxX = window.innerWidth - this.size.width;
    const maxY = window.innerHeight - this.size.height;

    // max between 0 and ... so it doesn't go past the left/top edge
    // min between newX and maxX ... so it doesn't go past the right/bottom edge
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
    this.resizeDirection = direction; // we need to save which handle was touched
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

    // Prevent the widget from going outside the viewport (same as in onDrag)
    const maxWidth = window.innerWidth - newLeft;
    const maxHeight = window.innerHeight - newTop;

    newWidth = Math.min(newWidth, maxWidth);
    newHeight = Math.min(newHeight, maxHeight);

    // Limits for the left and top of the browser:

    if (newLeft < 0) { // If we were to have x < 0
      newWidth += newLeft;  // Stops at the left edge. (Think that this runs at every pixel).
      newLeft = 0;  // Reposition the left edge.
    }

    if (newTop < 0) {  // If we were to have y < 0
      newHeight += newTop;  // Stops at the top edge.
      newTop = 0;  // Reposition the top edge.
    }

    /* Neither width nor height grow outside the left or top edge due to
    x and y themselves, which as they take negative values, stop their growth
    exactly at the left and top edges respectively. */

    // Prevent width/height from becoming negative
    newWidth = Math.max(newWidth, this.minWidth);
    newHeight = Math.max(newHeight, this.minHeight);

    // Apply the final changes
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
