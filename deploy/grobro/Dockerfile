# GroBro v2.7.5 with one change: readings reach the Growatt cloud at most once every
# GROWATT_CLOUD_DATA_INTERVAL seconds (cloud-data-interval.patch). The local feed is untouched.
FROM ghcr.io/robertzaage/grobro:v2.7.5 AS patched
COPY cloud-data-interval.patch /tmp/
RUN apk add --no-cache patch \
    && cd /app \
    && patch -p1 --forward < /tmp/cloud-data-interval.patch

# The patch's tests; the final image depends on this stage, so a failing test stops the deploy.
FROM patched AS test
COPY tests /tmp/cloud-interval-tests
RUN cd /app \
    && python -m pytest -q -p no:cacheprovider /tmp/cloud-interval-tests \
    && touch /tmp/cloud-interval-tests-passed

FROM patched
COPY --from=test /tmp/cloud-interval-tests-passed /tmp/
