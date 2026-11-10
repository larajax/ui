/*
 * Goal meter control
 *
 * Applies the goal meter style to a scoreboard item, a bar under its figure that fills to a percentage.
 *
 *     <div class="scoreboard-item title-value" data-control="goal-meter" data-value="88">
 *         <h4>Open rate</h4>
 *         <p>88%</p>
 *     </div>
 *
 * Data attributes:
 * - data-control="goal-meter" - enables the goal meter control
 * - data-value - sets the value, in percents
 *
 * The goal-meter-inverse class fills the meter in the negative colour, for a rate where higher is worse.
 *
 * JavaScript API:
 * jax.fetchControl(element, 'goal-meter').update(72)
 */
'use strict';

// Time the meter waits before it fills, so the fill animates in
const FILL_DELAY = 200;

export function registerGoalMeter(jax) {
    jax.registerControl('goal-meter', class extends jax.ControlBase {
        init() {
            this.config = Object.assign({
                value: 50
            }, this.config);
        }

        connect() {
            // Meter already drawn
            if (this.element.querySelector('span.goal-meter-indicator')) {
                return;
            }

            this.indicatorBar = document.createElement('span');
            this.indicatorBar.textContent = `${this.config.value}%`;
            this.indicatorOuter = document.createElement('span');
            this.indicatorOuter.className = 'goal-meter-indicator';
            this.indicatorOuter.setAttribute('role', 'progressbar');
            this.indicatorOuter.setAttribute('aria-valuemin', '0');
            this.indicatorOuter.setAttribute('aria-valuemax', '100');
            this.indicatorOuter.setAttribute('aria-valuenow', '0');
            this.indicatorOuter.appendChild(this.indicatorBar);

            const figure = this.element.querySelector('p');
            if (figure) {
                figure.after(this.indicatorOuter);
            }
            else {
                this.element.appendChild(this.indicatorOuter);
            }

            this.fillTimer = window.setTimeout(() => {
                this.update(this.config.value);
            }, FILL_DELAY);
        }

        disconnect() {
            window.clearTimeout(this.fillTimer);

            // Takes the meter out, so it fills again when the element reconnects
            if (this.indicatorOuter) {
                this.indicatorOuter.remove();
            }

            this.indicatorBar = null;
            this.indicatorOuter = null;
        }

        update(value) {
            if (this.indicatorBar) {
                const percent = Math.min(Math.max(Number(value) || 0, 0), 100);
                this.indicatorBar.style.width = `${percent}%`;
                this.indicatorOuter.setAttribute('aria-valuenow', String(percent));
            }
        }
    });
}
