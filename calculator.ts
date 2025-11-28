import { ChangeDetectionStrategy, Component, computed, signal } from '@angular/core';

// Define complex types (professional practice)
interface HealthMetric {
  value: number;
  label: string;
  unit: string;
}

@Component({
  selector: 'app-root',
  standalone: true,
  // Removed imports: [ResultCard] since it's now merged
  template: `
    <div class="min-h-screen bg-gray-50 flex items-start justify-center p-4">
      <div class="w-full max-w-xl bg-white shadow-2xl rounded-3xl p-6 sm:p-10 border border-t-8 border-purple-500 font-sans">
        
        <header class="text-center mb-8">
          <h1 class="text-4xl font-extrabold text-purple-700">Project HIVE: Edge Compute Module</h1>
          <p class="text-md text-gray-500 mt-2">High-performance reactive frontend using Angular Signals for real-time metric analysis.</p>
        </header>

        <!-- Input Section -->
        <div class="space-y-6">
          <h2 class="text-2xl font-semibold text-gray-700 border-b pb-2 mb-4">Input Data Stream</h2>

          <!-- Gender & Age -->
          <div class="flex flex-col sm:flex-row gap-4">
            <div class="flex-1">
              <label for="gender" class="block text-sm font-medium text-gray-600 mb-1">Gender State</label>
              <select id="gender" (change)="gender.set($event.target.value)"
                      class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150">
                <option value="male" selected>Male</option>
                <option value="female">Female</option>
              </select>
            </div>
            <div class="flex-1">
              <label for="age" class="block text-sm font-medium text-gray-600 mb-1">Time (Years)</label>
              <input type="number" id="age" min="1" [value]="age()" (input)="age.set(getNumberValue($event))"
                     class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                     placeholder="e.g., 30">
            </div>
          </div>

          <!-- Weight (kg) -->
          <div>
            <label for="weight" class="block text-sm font-medium text-gray-600 mb-1">Mass (kg)</label>
            <input type="number" id="weight" min="1" [value]="weightKg()" (input)="weightKg.set(getNumberValue($event))"
                   class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                   placeholder="e.g., 75">
          </div>

          <!-- Height (cm) -->
          <div>
            <label for="height" class="block text-sm font-medium text-gray-600 mb-1">Length (cm)</label>
            <input type="number" id="height" min="1" [value]="heightCm()" (input)="heightCm.set(getNumberValue($event))"
                   class="w-full p-3 border border-gray-300 rounded-lg shadow-sm focus:ring-purple-500 focus:border-purple-500 transition duration-150"
                   placeholder="e.g., 175">
          </div>
        </div>

        <!-- Result Section -->
        <div class="mt-10 p-6 bg-purple-50 rounded-2xl shadow-inner">
          <h2 class="text-2xl font-semibold text-purple-700 mb-6">Reactive Output Console</h2>
          
          @if (!isInputValid()) {
            <p class="text-red-500 text-center font-medium">Validation Error: Required parameters are missing or invalid.</p>
          }

          @if (isInputValid()) {
            <div class="space-y-6">
              
              <!-- Inlined BMI Card logic -->
              <div class="p-5 rounded-xl shadow-lg border-l-8 bg-indigo-100 border-indigo-500">
                  <div class="flex justify-between items-start">
                      <div>
                          <p class="text-sm font-medium text-gray-500">{{ bmiResult().label }}</p>
                          <p class="text-4xl font-extrabold mt-1 text-gray-800">{{ bmiResult().value }} <span class="text-base font-semibold text-gray-500">{{ bmiResult().unit }}</span></p>
                      </div>
                      <span [class]="getBadgeClass(bmiClassification())">{{ bmiClassification() }}</span>
                  </div>
              </div>
              
              <!-- Inlined BMR Card logic -->
              <div class="p-5 rounded-xl shadow-lg border-l-8 bg-purple-100 border-purple-500">
                  <div class="flex justify-between items-start">
                      <div>
                          <p class="text-sm font-medium text-gray-500">{{ bmrResult().label }}</p>
                          <p class="text-4xl font-extrabold mt-1 text-gray-800">{{ bmrResult().value }} <span class="text-base font-semibold text-gray-500">{{ bmrResult().unit }}</span></p>
                      </div>
                      <span [class]="getBadgeClass('Basal Energy Expenditure (BEE)')">Basal Energy Expenditure (BEE)</span>
                  </div>
              </div>

            </div>
          }
        </div>
      </div>
    </div>
  `,
  styles: [`
    /* Custom styling for subtle effects */
    .shadow-2xl {
      box-shadow: 0 25px 50px -12px rgba(0, 0, 0, 0.15);
    }
  `],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class App {
  // Input Signals
  gender = signal<'male' | 'female'>('male');
  age = signal<number | null>(30);
  weightKg = signal<number | null>(75);
  heightCm = signal<number | null>(175);

  // Helper function to safely extract number from input event
  getNumberValue(event: Event): number | null {
    const value = (event.target as HTMLInputElement).value;
    const num = parseFloat(value);
    return isNaN(num) || num <= 0 ? null : num;
  }

  // Helper function to generate dynamic badge classes, replacing the ResultCard's computed logic
  getBadgeClass(classification: string): string {
    let base = 'px-3 py-1 text-sm font-semibold rounded-full shadow-sm';
    const lowerClassification = classification.toLowerCase();

    if (lowerClassification.includes('low')) {
      return `${base} bg-blue-200 text-blue-800`;
    } else if (lowerClassification.includes('optimal')) {
      return `${base} bg-green-200 text-green-800`;
    } else if (lowerClassification.includes('elevated')) {
      return `${base} bg-yellow-200 text-yellow-800`;
    } else if (lowerClassification.includes('critical')) {
      return `${base} bg-red-200 text-red-800`;
    }
    // Default for BEE
    return `${base} bg-purple-200 text-purple-800`;
  }

  // Derived State (Computed Signals)
  
  // 1. Input Validation
  isInputValid = computed(() => 
    this.age() !== null && this.weightKg() !== null && this.heightCm() !== null &&
    this.age()! > 0 && this.weightKg()! > 0 && this.heightCm()! > 0
  );

  // 2. BMI Calculation (BMI = weight / (height/100)^2)
  bmi = computed(() => {
    const w = this.weightKg();
    const h = this.heightCm();

    if (!w || !h) return 0;
    const heightM = h / 100;
    return w / (heightM * heightM);
  });

  bmiClassification = computed(() => {
    const val = this.bmi();
    if (val === 0) return 'Awaiting Data';
    if (val < 18.5) return 'Low Mass Index';
    if (val >= 18.5 && val < 25) return 'Optimal Index';
    if (val >= 25 && val < 30) return 'Elevated Index';
    return 'Critical Mass Index';
  });

  bmiResult = computed<HealthMetric>(() => ({
    value: parseFloat(this.bmi().toFixed(2)),
    label: 'Physical Proportionality Index (PPI)',
    unit: 'kg/m²',
  }));
  
  // 3. BMR Calculation (Mifflin-St Jeor Equation)
  bmr = computed(() => {
    const w = this.weightKg();
    const h = this.heightCm();
    const a = this.age();
    const g = this.gender();

    if (!w || !h || !a) return 0;

    // Male: BMR = 10W + 6.25H - 5A + 5
    // Female: BMR = 10W + 6.25H - 5A - 161
    let result = (10 * w) + (6.25 * h) - (5 * a);
    
    if (g === 'male') {
      result += 5;
    } else { // female
      result -= 161;
    }
    return result;
  });

  bmrResult = computed<HealthMetric>(() => ({
    value: parseFloat(this.bmr().toFixed(0)),
    label: 'Basal Energy Expenditure (BEE)',
    unit: 'kcal/day',
  }));
}
