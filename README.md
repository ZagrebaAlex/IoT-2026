# Github Repository:

`https://github.com/ZagrebaAlex/IoT-2026`

# IoT-2026

A project that collects data from a mote network, saves temperature and humidity to a mongo database and presents the results in a dashboard.

## Fresh Ubuntu 16.04 Setup

These steps assume a fresh Ubuntu 16.04 VM used for TinyOS and for running the Dockerized web stack.

### 1. Update the system

```bash
sudo apt update
sudo apt upgrade -y
```

### 2. Install TinyOS prerequisites

```bash
sudo apt install -y \
  python2.7 python-minimal openjdk-8-jdk gcc-avr avr-libc nescc \
  minicom wget unzip automake autoconf libtool avrdude curl \
  gcc-msp430 git python-serial tinyos-tools
```

### 3. Install Docker and docker-compose

```bash
sudo apt-get install -y curl

sudo curl -L "https://github.com/docker/compose/releases/download/1.29.2/docker-compose-$(uname -s)-$(uname -m)" \
  -o /usr/local/bin/docker-compose

sudo chmod +x /usr/local/bin/docker-compose

docker-compose --version
```

After installation, confirm:

```bash
docker-compose --version
```

### 4. Clone or copy this repository

```bash
cd ~/Desktop
git clone github.com/ZagrebaAlex/IoT-2026
cd IoT-2026
```

## TinyOS Toolchain Setup

If TinyOS itself is not already installed:

```bash
git clone https://github.com/tinyos/tinyos-main.git ~/tinyos-main
cd ~/tinyos-main/tools
./Bootstrap
./configure
make
sudo make install
```

Add your user to the serial access group:

```bash
sudo usermod -aG dialout $USER
```

Then reboot or log out and log back in.

If your TinyOS environment requires it, load it before using `make`, `PrintfClient`, or `SerialForwarder`:

```bash
source /path/to/tinyos.sh
```

If you do not know where it is:

```bash
find ~ /opt -name tinyos.sh 2>/dev/null
```

## USB Port Discovery

List all mote USB ports:

```bash
ls /dev | grep ttyUSB
```

## Compile and Flash the Motes

### 1. Compile the IRIS parent

```bash
cd ~/Desktop/IoT-2026/Sensing/Base
make clean
make iris
```

### 2. Flash the IRIS parent

The parent must be node `0`.

```bash
cd ~/Desktop/IoT-2026/Sensing/Base
make iris install.0 mib520,/dev/ttyUSB1
```

### 3. Compile the TelosB leaf

```bash
cd ~/Desktop/IoT-2026/Sensing/Sampler
make clean
make telosb
```

### 4. Flash the TelosB leaf

Use node `1` for the first leaf, `2` for the second, and so on.

```bash
cd ~/Desktop/IoT-2026/Sensing/Sampler
make telosb install.1 bsl,/dev/ttyUSB0
```

## App and Ingestion Script setup

### 1. Build and start MongoDB and backend

```bash
cd ~/Desktop/IoT-2026
sudo docker-compose up -d mongo backend
```

### 2. Start ingestion from PrintfClient

Run:

```bash
cd ~/Desktop/IoT-2026
sudo java net.tinyos.tools.PrintfClient -comm serial@/dev/ttyUSB2:iris | sudo docker-compose run --rm -T ingestion
```

### 3. Open the dashboard

Setup Port forwarding on the vm, so that the port 8000 gets forwarded to the host machine.
Then open up localhost:8000 from the host.

---

# Αναφορά

## Ερώτημα 1:

Δημιουργήσαμε αυτοματο δίκτυο τοπολογίας αστέρα και ορίσαμε το Crossbow IRIS σταθερό κόμβο πατέρα και collector node.Τα υπόλοιπα motes με το Sampler app ξεκινούν χωρίς να γνωρίζουν ποιος είναι ο collector. Ο collector node κάνει periodic beacon broadcast,δηλαδή κάθε 5 δευτερόλεπτα ο iris στέλνει σε όλα τα mote οτι ειναι ο collector.Έτσι όταν ληφθούν αυτά τα beacons από το telosb,το telosb διαβάζει ποιος είναι ο parent ,αποθηκεύει το parentaddr και την κατάσταση απο unjoined σε joined. Μετά από αυτό το join,το Telosb αρχίζει να στέλνει sensor μετρήσεις κάθε 20 secs.
To Iris προωθεί αυτές τις μετρήσεις στο serial USB port του υπολογιστή.

## Ερώτημα 2:

Χρησιμοποιούμε ενα script στην python, το οποίο παίρνει ως είσοδο την έξοδο του PrintfClient, που αποτελείται από γραμμές που έχουν την μορφή:
node=1,temp=6588,humidity=1336,count=14
Έπειτα μετατρέπει τις raw μετρήσεις θερμοκρασίας και υγρασίας σε βαθμούς κελσίου και ποσοστό, και αποθηκεύει καθε record στην mongo βάση μας. Το timestamp απο το εκάστοτε δείγμα δίνεται από αυτό το script, καθώς τα motes δεν αποθηκεύουν τίποτα στη μνήμη τους και απλά κάνουν broadcast live τις τιμές τους.

## Ερώτημα 3:

Η web εφαρμογή μας έχει στηθεί με 2 επίπεδα: Backend με Python Fast API,Frontend με React.
Ο ρόλος του backend είναι να σερβίρει το frontend (με Server Side Rendering) και να φέρνει τα δεδομένα από την βάση μέσω των 4 endpoints που φτιάξαμε.

> /measurements/history (Φέρνει ιστορικά δεδομένα για ενα node)
> /nodes (Φέρνει την τελευταία εγγραφή για όλα τα nodes)
> /nodes/ID/latest (Φέρνει την τελευταία εγγραφή για ενα node)
> /ws/measurements (Φέρνει live δεδομένα για ενα node)
> Το frontend είναι React εφαρμογή με Vite και Material UI. Και αποτελείται από 2 σελίδες.
> Η μια ειναι η κεντρική οπου φαίνονται όλα τα nodes του δικτύου
> Και η άλλη είναι μια ειδική που δείχνει live data για ενα node συγκεκριμένα, και δίνει δυνατότητα προβολής ιστορικού με φίλτρα.

## Ερώτημα 4:

Στο notebook (forecasting.ipynb) τρέχουμε αρχικά μια συνάρτηση που κάνει extract τα δεδομένα από την mongo. Περνιούνται όλα τα records σε ενα Pandas dataFrame (Δεδομένα από 4 ημέρες, 15500 εγγραφές)
Για καθαρισμό των δεδομένων αφαιρούμε duplicate rows,καθώς και rows με N/A data (Στο συγκεκριμένο dataset den υπαρχουν ωστόσο). Έπειτα αφαιρούμε outliers (μικρότερα του q1-1.5*IQR ή μεγαλύτερα του q3+1.5*IQR) καθώς και μη ρεαλιστικές τιμές θερμοκρασίας, πχ <-20 ή >60 ή τιμές υγρασίας που δεν ειναι στο διαστημα 0-100.
Στατιστική ανάλυση των δεδομένων πριν τον καθαρισμό:

| Μέτρο                | Θερμοκρασία (°C) | Υγρασία (%) |
| -------------------- | ---------------: | ----------: |
| Ελάχιστη τιμή        |            23.92 |       26.81 |
| 1ο τεταρτημόριο (Q1) |            25.83 |       47.58 |
| Διάμεσος (Q2)        |            25.93 |       47.78 |
| 3ο τεταρτημόριο (Q3) |            26.15 |       47.96 |
| Μέγιστη τιμή         |            38.82 |       53.01 |
| Μέσος όρος           |            26.01 |       47.61 |
| Τυπική απόκλιση      |             0.39 |        0.96 |

Στατιστική μετά τον καθαρισμό

| Μέτρο                | Θερμοκρασία (°C) | Υγρασία (%) |
| -------------------- | ---------------: | ----------: |
| Ελάχιστη τιμή        |            25.66 |       47.03 |
| 1ο τεταρτημόριο (Q1) |            25.82 |       47.61 |
| Διάμεσος (Q2)        |            25.92 |       47.80 |
| 3ο τεταρτημόριο (Q3) |            26.13 |       47.96 |
| Μέγιστη τιμή         |            26.50 |       48.35 |
| Μέσος όρος           |            25.96 |       47.78 |
| Τυπική απόκλιση      |             0.16 |        0.23 |

Ο αισθητήρας βρισκόταν σε εσωτερικό χώρο καθ’ όλη τη διάρκεια της καταγραφής. Επομένως, οι συνθήκες θερμοκρασίας και υγρασίας αναμένονταν σχετικά σταθερές. Μετά την αφαίρεση των ακραίων και μη ρεαλιστικών τιμών, η τυπική απόκλιση είναι ιδιαίτερα μικρή τόσο για τη θερμοκρασία (`0.16 °C`) όσο και για την υγρασία (`0.23%`).

### Linear Regression

Η διαδικασία της πρόβλεψης με Linear Regression ξεκινά με τον υπολογισμό διάφορων μοντέλων για την εύρεση του καλύτερου, με βάση σύγκρισης των MSE που βγάζει το κάθε μοντέλο για το validation set.
Για όλους τους συνδυασμούς παραμέτρων που θα εξετάσουμε παρακάτω, ακολουθείται η εξής διαδικασία. Αρχικά παίρνουμε το καθαρό dataframe και δημιουργούμε παραπάνω columns. Τα παραπάνω columns αυτά είναι τα lags της αρχικής σειράς των τιμών της θερμοκρασίας και υγρασίας, και τιμές που δοκιμάζονται είναι για παράδειγμα 1 3, 9. Lags είναι η στήλη όπως ήταν αλλά μετατοπισμένη κατά κάποιες θέσεις προς τα πάνω, και ο αριθμός των θέσεων εξαρτάται από τον αριθμό που θέτω ως lag, έστω n. Με τον τρόπο αυτό γίνεται αντιστοίχηση της κάθε τιμής με την τιμή n θέσεις πιο μετά. Έτσι το μοντέλο μπορεί να μάθει το αντίστοιχο seasonality. Επίσης δημιουργούνται στήλες με moving average τιμές. Για τις στήλες του temperature και humidity. Συνεπώς καταλήγουμε με ένα νέο dataframe το οποίο έχει αυτές τις έξτρα στήλες, και άλλες δύο, για το target temperature και target humidity.
Το επόμενο βήμα είναι να χρησιμοποιήσουμε το dataframe αυτό ώστε να εκπαιδεύσουμε ένα μοντέλο. Αρχικά, χωρίζουμε το dataframe σε train, validation και test sets, με ποσοστά 80%, 10% και 10% αντίστοιχα του dataframe, και δημιουργούμε ένα model object με τη χρήση των μεθόδων LinearRegression για καθόλου regularization, Ridge για L2, και Lasso για L1, από την scikit learn. Χρησιμοποιούμε τη συνάρτηση fit() με παράμετρο fit_intercept=True, για να βρούμε κατάλληλα w, b για την ευθεία y = wx + b που καθορίζει τα δεδομένα, όπου x εδώ είναι το dataframe και y είναι οι στήλες με τα target values για θερμοκρασία και υγρασία. Άρα πλέον με ένα εκπαιδευμένο μοντέλο, κάνουμε την πρόβλεψη με βάση τα features του validation set, και συγκρίνουμε αυτή την πρόβλεψη με τα πραγματικά δεδομένα για να πάρουμε το MSE και το R^2. Συνεπώς, επιστρέφουμε σε ένα dictionary, το μοντέλο που υπολογίσαμε σε μορφή object, το mse και το r^2 που υπολογίσαμε.
Τρέχουμε αυτή τη διαδικασία για όλους τους συνδυασμούς υπερ παραμέτρων (οι οποίες είναι τελικά, lags, παράθυρα για moving average, αν θα έχουμε regularization και με τι σταθερά α θα επηρεάζει) και επιστρέφουμε το μοντέλο με το χαμηλότερο MSE, καθώς και το dataframe που μας οδήγησε σε αυτό το αποτέλεσμα χάρη στα features που επιλέξαμε. Άρα παίρνουμε το dataframe αυτό χωρισμένο σε train, validation και test sets και κάνουμε την πρόβλεψη για το test set, την οποία και συγκρίνουμε με τις πραγματικές του τιμές για να πάρουμε το MSE και R^2 για το test set, ως τελική απόδοση του μοντέλου.
Στη συνέχεια έχοντας πλέον κατάλληλο μοντέλο και features προβλέπουμε επόμενες τιμές, πέρα από το dataset που έχουμε. Κρατάμε το τελευταίο row αλλά μόνο με τα feature columns, και με την μέθοδο predict(), περνώντας ως παράμετρο το τελευταίο row αυτό, παίρνουμε ως αποτέλεσμα το prediction για την επόμενη τιμή θερμοκρασίας και υγρασίας. Από μαθηματικής άποψης, για το y = wx + b, έχουμε το μοντέλο από όπου γνωρίζουμε τα w, b και περνάμε το x που είναι το τελευταίο row, με αποτέλεσμα να πάρουμε το y που είναι το επόμενο στοιχείο. Για επόμενα αποτελέσματα, περνάμε αυτή την πρόβλεψη στο τέλος του αρχικού clean dataframe, και ξαναυπολογίζουμε τα features, άρα περνάμε αυτό το νέο x στην εξίσωση και παίρνουμε και το αμέσως επόμενο y. Επαναλαμβάνουμε αυτή τη διαδικασία για όσες τιμές σε βάθος χρόνου θέλουμε να προβλέψουμε. Για παράδειγμα στον κώδικα που γράψαμε παίρνουμε τις εξής προβλέψεις:
Prediction 1h later: [26.35045485 46.34217053]
Prediction 2h later: [26.35028595 46.49855111]
Prediction 5h later: [26.32879865 46.75556469]
Με πρώτο στοιχείο στη λίστα τη θερμοκρασία και 2ο την υγρασία. Παρατηρείται ότι όσο προχωράει ο χρόνος, τόσο πιο πιθανό είναι το αποτέλεσμα να συγκλίνει σε κάποιο μέσο, που για τις τιμές αυτές, γνωρίζουμε από νωρίτερα ότι είναι κοντά στις τιμές που βγάζουμε για τις ώρες αυτές.

### ARIMA

Η μέθοδος ARIMA λειτουργεί διαφορετικά από τη γραμμική παλινδρόμηση. Παρατηρεί seasonality στα δεδομένα, δημιουργώντας κατάλληλη συνάρτηση περιγραφής τους ώστε να έχουν την ίδια μέση τιμή στο χρόνο και βρίσκει μελλοντικές τιμές χρησιμοποιώντας την ιδιότητα αυτή. Παίρνουμε το καθαρό dataset και κάνουμε χωριστές προβλέψεις για θερμοκρασία και υγρασία ώστε να υπάρχει ένα target value. Συνεπώς η παρακάτω διαδικασία είναι η ίδια και για τις δύο κατηγορίες, αλλά θα εξετάσουμε πώς λειτουργεί για τη θερμοκρασία. Αρχικά δημιουργούμε ένα dataset το οποίο, περιέχει τις χρονικές στιγμές από το καθαρό dataset και ελέγχει αν υπάρχουν κενά ή αν χρειάζεται να συμπληρώσει κάτι. Στη συνέχεια το σπάμε σε train, val, test sets, και για διάφορες παραμέτρους του ARIMA, p: πόσες προηγούμενες τιμές θα χρησιμοποιήσουμε για τις επόμενες, d: πόσα προηγούμενα στοιχεία ορίζονται για διαφορές από το τωρινό, q: πόσα lagged forecast errors κρατάει και χρησιμοποιεί. Βρίσκουμε την ακολουθία χάρη στο train, ελέγχουμε με βάση το validation και κρατάμε το καλύτερο, το οποίο και εξετάζουμε ως προς την αποδοτικότητα με βάση το test. Στη συνέχεια εκπαιδεύουμε ένα νέο μοντέλο πάνω σε όλο το dataset, με βάση τις καλύτερες παραμέτρους που βγάλαμε από νωρίτερα, ώστε να προβλέψουμε πιο αποδοτικά τις επόμενες μελλοντικές τιμές μετά το test. Παρατηρούμε ότι τα αποτελέσματα είναι πολύ παρόμοια με αυτά με τη χρήση Linear Regression.
