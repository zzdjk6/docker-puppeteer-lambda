FROM public.ecr.aws/lambda/nodejs:22-x86_64

# Chrome for testing
# Refer: https://github.com/umihico/docker-selenium-lambda/blob/main/Dockerfile
RUN dnf install -y atk cups-libs gtk3 libXcomposite alsa-lib \
    libXcursor libXdamage libXext libXi libXrandr libXScrnSaver \
    libXtst pango at-spi2-atk libXt xorg-x11-server-Xvfb \
    xorg-x11-xauth dbus-glib dbus-glib-devel nss mesa-libgbm
RUN npx --yes @puppeteer/browsers install --path /opt chrome@137.0.7151.70

# Code
COPY package*.json ./
RUN npm install

COPY app.mjs ./
COPY .puppeteerrc.cjs ./

# Command can be overwritten by providing a different command in the template directly.
CMD ["app.lambdaHandler"]
