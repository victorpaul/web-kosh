import { ChangeDetectionStrategy, Component } from '@angular/core';
import { TypingTextComponent } from '../../shared/components/typing-text/typing-text.component';
import { TimelineComponent } from '../../shared/components/timeline/timeline.component';
import { RouterLink } from '@angular/router';
import { TranslatePipe } from '../../core/i18n/translate.pipe';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [RouterLink, TypingTextComponent, TimelineComponent, TranslatePipe],
  templateUrl: './home.component.html',
  styleUrl: './home.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class HomeComponent {}
