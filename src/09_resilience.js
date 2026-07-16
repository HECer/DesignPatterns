<script>
/* ================= RESILIENZ & CLOUD ================= */
PATTERNS.push(
{
  id:'retry', name:'Retry (mit Backoff)', cat:'resilience', gof:false, icon:'🔄',
  short:{de:'Wiederholt fehlgeschlagene Aufrufe automatisch – mit wachsenden Wartezeiten.',
         en:'Automatically repeats failed calls – with growing wait times.'},
  intent:{de:'Netzwerke haben transiente Fehler: kurze Aussetzer, Timeouts, überlastete Dienste. Retry versucht den Aufruf erneut – idealerweise mit exponentiellem Backoff (1s, 2s, 4s …) plus Zufalls-Jitter, damit nicht alle Clients gleichzeitig wiederkommen. Wichtig: nur bei transienten Fehlern und idempotenten Operationen wiederholen! In .NET übernimmt das Polly, in Python z. B. tenacity.',
          en:'Networks have transient faults: brief outages, timeouts, overloaded services. Retry attempts the call again – ideally with exponential backoff (1s, 2s, 4s …) plus random jitter so all clients do not return simultaneously. Important: only retry transient errors and idempotent operations! In .NET Polly handles this, in Python e.g. tenacity.'},
  analogy:{de:'Besetztzeichen am Telefon: Du legst auf, wartest kurz und wählst erneut – aber mit jedem Versuch etwas länger, statt pausenlos die Wahlwiederholung zu hämmern.',
           en:'A busy phone line: you hang up, wait a bit and dial again – but a little longer with each attempt, instead of hammering redial nonstop.'},
  use:{de:['Transiente Netzwerk-/API-Fehler (HTTP 503, Timeout)','Cloud-Dienste mit kurzen Störungen','Warteschlangen-/Datenbank-Verbindungsaufbau'],
       en:['Transient network/API errors (HTTP 503, timeout)','Cloud services with brief hiccups','Queue/database connection setup']},
  pros:{de:['Überbrückt kurze Störungen unsichtbar','Mit Backoff+Jitter netzfreundlich','Als Bibliothek deklarativ nutzbar'],
        en:['Bridges brief outages invisibly','Network-friendly with backoff+jitter','Declaratively usable as a library']},
  cons:{de:['Verschlimmert Überlast ohne Backoff','Gefährlich bei nicht-idempotenten Aktionen','Verlängert Latenz im Fehlerfall'],
        en:['Worsens overload without backoff','Dangerous for non-idempotent actions','Increases latency in failure cases']},
  related:['circuit-breaker','saga','proxy'],
  csharp:
`// Retry mit exponentiellem Backoff + Jitter:
async Task<T> RetryAsync<T>(Func<Task<T>> action,
                            int maxAttempts = 4)
{
    var rnd = new Random();
    for (int attempt = 1; ; attempt++)
    {
        try
        {
            return await action();
        }
        catch (HttpRequestException ex)
            when (attempt < maxAttempts)   // nur transiente Fehler!
        {
            var delay = TimeSpan.FromSeconds(
                Math.Pow(2, attempt - 1))          // 1s, 2s, 4s
                + TimeSpan.FromMilliseconds(rnd.Next(250));
            Console.WriteLine(
                $"Versuch {attempt} scheiterte ({ex.Message}). " +
                $"Warte {delay.TotalSeconds:F1}s ...");
            await Task.Delay(delay);
        }
    }
}

var result = await RetryAsync(() =>
    new HttpClient().GetStringAsync("https://api.example.com"));
// Produktionsreif: Polly –
// Policy.Handle<HttpRequestException>().WaitAndRetryAsync(...)`,
  python:
`import random, time

def retry(max_attempts=4, base_delay=1.0):
    """Decorator: Retry mit exponentiellem Backoff + Jitter."""
    def wrapper(fn):
        def inner(*args, **kwargs):
            for attempt in range(1, max_attempts + 1):
                try:
                    return fn(*args, **kwargs)
                except ConnectionError as ex:
                    if attempt == max_attempts:
                        raise                    # aufgeben
                    delay = base_delay * 2 ** (attempt - 1)
                    delay += random.uniform(0, 0.25)   # Jitter
                    print(f"Versuch {attempt} scheiterte ({ex}). "
                          f"Warte {delay:.1f}s ...")
                    time.sleep(delay)
        return inner
    return wrapper

@retry(max_attempts=4)
def fetch_data():
    ...  # API-Aufruf, der scheitern kann

# Produktionsreif: tenacity –
# @retry(wait=wait_exponential(), stop=stop_after_attempt(4))`
},
{
  id:'circuit-breaker', name:'Circuit Breaker', cat:'resilience', gof:false, icon:'⚡',
  short:{de:'Eine Sicherung für Service-Aufrufe: Nach zu vielen Fehlern wird der Stromkreis geöffnet.',
         en:'A fuse for service calls: after too many failures, the circuit opens.'},
  intent:{de:'Wenn ein Dienst dauerhaft ausfällt, macht ständiges Retry alles schlimmer. Der Circuit Breaker zählt Fehler und kippt bei Überschreitung in den Zustand OFFEN: Aufrufe schlagen sofort fehl (fail fast), der kranke Dienst bekommt Ruhe. Nach einer Abkühlzeit testet HALB-OFFEN vorsichtig, ob es wieder geht – dann zurück zu GESCHLOSSEN. Ein Muster aus Michael Nygards „Release It!", heute Standard in jeder Microservice-Architektur.',
          en:'When a service is persistently down, constant retrying makes everything worse. The circuit breaker counts failures and flips to OPEN when exceeded: calls fail immediately (fail fast), the sick service gets rest. After a cool-down, HALF-OPEN cautiously tests recovery – then back to CLOSED. A pattern from Michael Nygard’s "Release It!", now standard in every microservice architecture.'},
  analogy:{de:'Die Sicherung im Haus: Bei Überlast fliegt sie raus und trennt den Stromkreis, bevor die Leitung durchbrennt. Erst nach Prüfung schaltet man sie wieder ein.',
           en:'The fuse in your house: on overload it trips and cuts the circuit before the wiring burns. Only after checking do you switch it back on.'},
  use:{de:['Schutz vor kaskadierenden Ausfällen in Microservices','Externe APIs mit Ausfallrisiko','Zusammen mit Retry: erst Retry, dann Breaker'],
       en:['Protection from cascading failures in microservices','External APIs with outage risk','Together with Retry: retry first, then breaker']},
  pros:{de:['Fail fast statt Timeout-Stau','Kranker Dienst kann sich erholen','Systemweite Kaskaden werden verhindert'],
        en:['Fail fast instead of timeout pileups','Sick services can recover','System-wide cascades are prevented']},
  cons:{de:['Schwellwerte richtig zu wählen ist schwer','Zusätzlicher Zustand pro Abhängigkeit','Fallback-Logik muss trotzdem her'],
        en:['Choosing thresholds correctly is hard','Extra state per dependency','Fallback logic is still needed']},
  related:['retry','proxy','state','saga'],
  demo:'circuit',
  csharp:
`public class CircuitBreaker(int threshold = 3,
                             int coolDownSeconds = 10)
{
    private int _failures;
    private DateTime _openedAt;
    public string State { get; private set; } = "GESCHLOSSEN";

    public T Call<T>(Func<T> action, Func<T> fallback)
    {
        if (State == "OFFEN")
        {
            if (DateTime.Now - _openedAt
                < TimeSpan.FromSeconds(coolDownSeconds))
                return fallback();          // sofort abweisen
            State = "HALB-OFFEN";           // vorsichtig testen
        }
        try
        {
            var result = action();
            _failures = 0; State = "GESCHLOSSEN";
            return result;
        }
        catch
        {
            _failures++;
            if (_failures >= threshold || State == "HALB-OFFEN")
            {
                State = "OFFEN"; _openedAt = DateTime.Now;
                Console.WriteLine("⚡ Sicherung ausgelöst!");
            }
            return fallback();
        }
    }
}

var breaker = new CircuitBreaker();
for (int i = 0; i < 5; i++)
    breaker.Call<string>(
        () => throw new Exception("Service down"),
        () => "Fallback: gecachte Daten");
Console.WriteLine(breaker.State);   // OFFEN`,
  python:
`import time

class CircuitBreaker:
    def __init__(self, threshold=3, cool_down=10.0):
        self.threshold, self.cool_down = threshold, cool_down
        self.failures, self.opened_at = 0, 0.0
        self.state = "GESCHLOSSEN"

    def call(self, action, fallback):
        if self.state == "OFFEN":
            if time.time() - self.opened_at < self.cool_down:
                return fallback()        # sofort abweisen
            self.state = "HALB-OFFEN"    # vorsichtig testen
        try:
            result = action()
            self.failures, self.state = 0, "GESCHLOSSEN"
            return result
        except Exception:
            self.failures += 1
            if (self.failures >= self.threshold
                    or self.state == "HALB-OFFEN"):
                self.state = "OFFEN"
                self.opened_at = time.time()
                print("⚡ Sicherung ausgelöst!")
            return fallback()

def broken_service():
    raise ConnectionError("Service down")

breaker = CircuitBreaker()
for _ in range(5):
    breaker.call(broken_service, lambda: "Fallback: Cache")
print(breaker.state)   # OFFEN`
},
{
  id:'saga', name:'Saga', cat:'resilience', gof:false, icon:'🧭',
  short:{de:'Verteilte Transaktionen als Kette lokaler Schritte – mit Kompensation statt Rollback.',
         en:'Distributed transactions as a chain of local steps – with compensation instead of rollback.'},
  intent:{de:'Über mehrere Microservices hinweg gibt es keine klassische Transaktion. Eine Saga zerlegt den Geschäftsvorgang in lokale Schritte (Zahlung, Lager, Versand); scheitert einer, werden die bereits erfolgreichen Schritte durch Kompensations-Aktionen rückgängig gemacht (Geld erstatten, Reservierung aufheben). Zwei Varianten: Orchestrierung (zentraler Koordinator) und Choreografie (Events).',
          en:'Across multiple microservices there is no classic transaction. A saga splits the business operation into local steps (payment, inventory, shipping); if one fails, the already successful steps are undone via compensating actions (refund money, release reservation). Two variants: orchestration (central coordinator) and choreography (events).'},
  analogy:{de:'Eine Reisebuchung: Flug gebucht, Hotel gebucht – Mietwagen ausgebucht? Dann werden Flug und Hotel eben wieder storniert. Jeder Schritt hat sein eigenes „Storno".',
           en:'Booking a trip: flight booked, hotel booked – rental car unavailable? Then flight and hotel simply get cancelled again. Every step has its own "cancellation".'},
  use:{de:['Geschäftsvorgänge über mehrere Services/Datenbanken','Bestellprozesse: Zahlung + Lager + Versand','Überall, wo 2-Phase-Commit nicht praktikabel ist'],
       en:['Business operations across multiple services/databases','Order processes: payment + inventory + shipping','Wherever two-phase commit is impractical']},
  pros:{de:['Konsistenz ohne verteilte Locks','Jeder Service bleibt autonom','Fehlerpfade explizit modelliert'],
        en:['Consistency without distributed locks','Each service stays autonomous','Failure paths explicitly modeled']},
  cons:{de:['Kompensationen müssen fachlich existieren','Eventual Consistency für Zwischenzustände','Debugging verteilter Abläufe anspruchsvoll'],
        en:['Compensations must exist in the domain','Eventual consistency for intermediate states','Debugging distributed flows is demanding']},
  related:['command','circuit-breaker','event-sourcing','publish-subscribe'],
  csharp:
`public record SagaStep(string Name, Func<bool> Execute,
                       Action Compensate);

public class OrderSaga
{
    private readonly List<SagaStep> _steps = new();
    public OrderSaga AddStep(SagaStep s)
    { _steps.Add(s); return this; }

    public bool Run()
    {
        var done = new Stack<SagaStep>();
        foreach (var step in _steps)
        {
            Console.WriteLine($"→ {step.Name}");
            if (!step.Execute())
            {
                Console.WriteLine($"✗ {step.Name} fehlgeschlagen!");
                while (done.Count > 0)          // Kompensation
                {
                    var s = done.Pop();
                    Console.WriteLine($"↩ Storniere: {s.Name}");
                    s.Compensate();
                }
                return false;
            }
            done.Push(step);
        }
        return true;
    }
}

new OrderSaga()
    .AddStep(new("Zahlung einziehen",
        () => true,  () => Console.WriteLine("  Geld erstattet")))
    .AddStep(new("Lager reservieren",
        () => true,  () => Console.WriteLine("  Reserv. gelöst")))
    .AddStep(new("Versand beauftragen",
        () => false, () => { }))       // scheitert!
    .Run();`,
  python:
`from dataclasses import dataclass
from typing import Callable

@dataclass
class SagaStep:
    name: str
    execute: Callable[[], bool]
    compensate: Callable[[], None]

class OrderSaga:
    def __init__(self):
        self._steps: list[SagaStep] = []

    def add_step(self, step: SagaStep):
        self._steps.append(step); return self

    def run(self) -> bool:
        done: list[SagaStep] = []
        for step in self._steps:
            print(f"→ {step.name}")
            if not step.execute():
                print(f"✗ {step.name} fehlgeschlagen!")
                for s in reversed(done):    # Kompensation
                    print(f"↩ Storniere: {s.name}")
                    s.compensate()
                return False
            done.append(step)
        return True

(OrderSaga()
 .add_step(SagaStep("Zahlung einziehen",
     lambda: True, lambda: print("  Geld erstattet")))
 .add_step(SagaStep("Lager reservieren",
     lambda: True, lambda: print("  Reserv. gelöst")))
 .add_step(SagaStep("Versand beauftragen",
     lambda: False, lambda: None))      # scheitert!
 .run())`
}
);
</script>
