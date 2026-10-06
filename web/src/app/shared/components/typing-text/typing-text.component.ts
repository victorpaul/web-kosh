import { ChangeDetectionStrategy, Component, effect, input, signal } from '@angular/core';

@Component({
  selector: 'app-typing-text',
  standalone: true,
  templateUrl: './typing-text.component.html',
  styleUrl: './typing-text.component.scss',
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class TypingTextComponent {
  readonly text = input.required<string>();
  readonly typingSpeedMs = input(5);
  readonly startDelayMs = input(500);

  readonly visibleText = signal('');

  constructor() {
    /* re-types from the start whenever the text changes (e.g. on a language switch) */
    effect((onCleanup) => {
      const fullText = this.text();
      const speed = this.typingSpeedMs();
      let charIndex = 0;
      let timeoutId: ReturnType<typeof setTimeout>;

      const typeNextChar = () => {
        if (charIndex >= fullText.length) return;
        this.visibleText.set(fullText.slice(0, ++charIndex));
        timeoutId = setTimeout(typeNextChar, speed);
      };

      this.visibleText.set('');
      timeoutId = setTimeout(typeNextChar, this.startDelayMs());
      onCleanup(() => clearTimeout(timeoutId));
    });
  }
}
