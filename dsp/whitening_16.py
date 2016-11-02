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
fn_16 = 'H-H1_LOSC_16_V1-1126259446-32.hdf5'
strain_16, time_16, chan_dict = rl.loaddata(fn_16, 'H1')

# sampling rate:
fs = 16384
time = time_16
# the time sample interval (uniformly sampled!)
dt = time[1] - time[0]

NFFT = 1 * fs
# Amplitude Spectral Densities
# Estimate of strain-equivalent noise vs frequency
Pxx_16, freqs_16 = mlab.psd(strain_16, Fs = fs, NFFT = NFFT)

# We will use interpolations of the ASDs computed above for whitening:
psd_16 = interp1d(freqs_16, Pxx_16)

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

# now whiten the data
strain_16_whiten = whiten(strain_16,psd_16,dt)

# We need to suppress the high frequencies with some bandpassing:
# cuts off frequency components below 20Hz and above 300Hz
bb, ab = butter(4, [20.*2./fs, 300.*2./fs], btype='band')
strain_16_whiten = filtfilt(bb, ab, strain_16_whiten)

# plot the data after whitening:
# plot +- 5 seconds around the event:
tevent = 1126259462.422         # Mon Sep 14 09:50:45 GMT 2015

# plt.figure()
# plt.plot(time-tevent,strain_16_whiten,'r',label='H1 strain (16)')
# plt.xlim([-0.1,0.05])
# plt.ylim([-4,4])
# plt.xlabel('time (s) since '+str(tevent))
# plt.ylabel('whitented strain')
# plt.legend(loc='lower left')
# plt.title('Advanced LIGO WHITENED strain data near GW150914')
# plt.savefig('check3')

# h1array = list(t) for t in zip(time-tevent, strain_H1_whitenbp) # H1 downsamples csv
h1_16_array = [list(t) for t in zip(time-tevent, strain_16_whiten)] # H1 csv
# template_array = [list(t) for t in zip(NRtime+0.002,NR_H1_whitenbp)] # Model template


a = np.asarray(h1_16_array)
np.savetxt("H1_16384hz.csv", a, delimiter=",")
