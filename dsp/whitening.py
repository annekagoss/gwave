# Standard python numerical analysis imports:
import numpy as np
from scipy import signal
from scipy.interpolate import interp1d
from scipy.signal import butter, filtfilt, iirdesign, zpk2tf, freqz
import matplotlib.pyplot as plt
import matplotlib.mlab as mlab
import h5py

# LIGO-specific readligo.py
import readligo as rl

#----------------------------------------------------------------
# Load LIGO data from a single file
#----------------------------------------------------------------
# First from H1
fn_H1 = 'H-H1_LOSC_4_V1-1126259446-32.hdf5'
strain_H1, time_H1, chan_dict_H1 = rl.loaddata(fn_H1, 'H1')
# and then from L1
fn_L1 = 'L-L1_LOSC_4_V1-1126259446-32.hdf5'
strain_L1, time_L1, chan_dict_L1 = rl.loaddata(fn_L1, 'L1')

# sampling rate:
fs = 4096
# both H1 and L1 will have the same time vector, so:
time = time_H1
# the time sample interval (uniformly sampled!)
dt = time[1] - time[0]

# read in the numerical relativity template
NRtime, NR_H1 = np.genfromtxt('GW150914_4_NR_waveform.txt').transpose()

# plot +- 5 seconds around the event:
tevent = 1126259462.422         # Mon Sep 14 09:50:45 GMT 2015
deltat = 5.                     # seconds around the event
# index into the strain time series for this time interval:
indxt = np.where((time_H1 >= tevent-deltat) & (time_H1 < tevent+deltat))

# number of sample for the fast fourier transform:
NFFT = 1*fs  #sampling rate

#only plot data between 10 and 2000 Hz
fmin = 10
fmax = 2000

# Amplitude Spectral Densities
# Estimate of strain-equivalent noise vs frequency
Pxx_H1, freqs = mlab.psd(strain_H1, Fs = fs, NFFT = NFFT)
Pxx_L1, freqs = mlab.psd(strain_L1, Fs = fs, NFFT = NFFT)

# We will use interpolations of the ASDs computed above for whitening:
psd_H1 = interp1d(freqs, Pxx_H1)
psd_L1 = interp1d(freqs, Pxx_L1)

# ## Whitening
# function to whiten data
def whiten(strain, interp_psd, dt):
    Nt = len(strain)
    freqs = np.fft.rfftfreq(Nt, dt)

    # whitening: transform to freq domain, divide by asd, then transform back,
    # taking care to get normalization right.
    hf = np.fft.rfft(strain)
    white_hf = hf / (np.sqrt(interp_psd(freqs) /dt/2.))
    white_ht = np.fft.irfft(white_hf, n=Nt)
    return white_ht

# now whiten the data from H1 and L1, and also the NR template:

# dt is the time sample interval
# strain_H1 is the original data
# psd_H1 is the ASD of the data
strain_H1_whiten = whiten(strain_H1,psd_H1,dt)
strain_L1_whiten = whiten(strain_L1,psd_L1,dt)
NR_H1_whiten = whiten(NR_H1,psd_H1,dt)

# We need to suppress the high frequencies with some bandpassing:
# cuts off frequency components below 20Hz and above 300Hz
bb, ab = butter(4, [20.*2./fs, 300.*2./fs], btype='band')
strain_H1_whitenbp = filtfilt(bb, ab, strain_H1_whiten)
strain_L1_whitenbp = filtfilt(bb, ab, strain_L1_whiten)
NR_H1_whitenbp = filtfilt(bb, ab, NR_H1_whiten)

# plot the data after whitening:
# first, shift L1 by 7 ms, and invert. See the GW150914 detection paper for why!
strain_L1_shift = -np.roll(strain_L1_whitenbp,int(0.007*fs))

# plt.figure()
# plt.plot(time-tevent,strain_H1_whitenbp,'r',label='H1 strain')
# plt.plot(time-tevent,strain_L1_shift,'g',label='L1 strain')
# plt.plot(NRtime+0.002,NR_H1_whitenbp,'k',label='matched NR waveform')
# plt.xlim([-0.1,0.05])
# plt.ylim([-4,4])
# plt.xlabel('time (s) since '+str(tevent))
# plt.ylabel('whitented strain')
# plt.legend(loc='lower left')
# plt.title('Advanced LIGO WHITENED strain data near GW150914')
# plt.savefig('check2')

# h1array = list(t) for t in zip(time-tevent, strain_H1_whitenbp) # H1 downsamples csv
template_array = [list(t) for t in zip(NRtime+0.002,NR_H1_whitenbp)] # Model template

# print array

a = np.asarray(template_array)
np.savetxt("template_downsampled.csv", a, delimiter=",")
