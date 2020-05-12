#!/bin/sh
cd functions && gcloud functions deploy challenge --runtime go113 --trigger-http --entry-point ChallengeHandler --allow-unauthenticated
