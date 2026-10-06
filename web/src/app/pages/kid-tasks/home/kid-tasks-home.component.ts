import { ChangeDetectionStrategy, Component } from '@angular/core';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../../core/i18n/translate.pipe';
import { ShapeComponent } from '../components/shape/shape.component';

@Component({
  selector: 'app-kid-tasks-home',
  standalone: true,
  imports: [RouterLink, TranslatePipe, ShapeComponent],
  templateUrl: './kid-tasks-home.component.html',
  styleUrl: './kid-tasks-home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class KidTasksHomeComponent {}
