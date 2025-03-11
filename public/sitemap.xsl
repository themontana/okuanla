<?xml version="1.0" encoding="UTF-8"?>
<xsl:stylesheet version="2.0" 
                xmlns:xsl="http://www.w3.org/1999/XSL/Transform"
                xmlns:sitemap="http://www.sitemaps.org/schemas/sitemap/0.9"
                xmlns:image="http://www.google.com/schemas/sitemap-image/1.1">
  <xsl:output method="html" version="1.0" encoding="UTF-8" indent="yes"/>
  
  <xsl:template match="/">
    <html xmlns="http://www.w3.org/1999/xhtml">
      <head>
        <title>XML Sitemap - OkuAnla</title>
        <meta http-equiv="Content-Type" content="text/html; charset=utf-8" />
        <style type="text/css">
          body {
            font-family: -apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, Oxygen-Sans, Ubuntu, Cantarell, "Helvetica Neue", sans-serif;
            color: #333;
            margin: 0;
            padding: 20px;
          }
          h1 {
            color: #0066cc;
            font-size: 24px;
            margin-bottom: 20px;
          }
          table {
            border-collapse: collapse;
            width: 100%;
            background: #fff;
            margin-bottom: 20px;
          }
          th {
            background-color: #f4f4f4;
            text-align: left;
            padding: 10px;
            font-weight: bold;
            border-bottom: 1px solid #ddd;
          }
          td {
            padding: 10px;
            border-bottom: 1px solid #eee;
            vertical-align: top;
          }
          .url {
            color: #0066cc;
            text-decoration: none;
          }
          .url:hover {
            text-decoration: underline;
          }
          .priority {
            text-align: center;
          }
          .changefreq {
            text-align: center;
          }
          .lastmod {
            text-align: center;
          }
        </style>
      </head>
      <body>
        <h1>XML Sitemap - OkuAnla</h1>
        <table>
          <tr>
            <th>URL</th>
            <th>Images</th>
            <th>Priority</th>
            <th>Change Frequency</th>
            <th>Last Modified</th>
          </tr>
          <xsl:for-each select="sitemap:urlset/sitemap:url">
            <tr>
              <td>
                <a href="{sitemap:loc}" class="url"><xsl:value-of select="sitemap:loc"/></a>
              </td>
              <td>
                <xsl:value-of select="count(image:image)"/>
              </td>
              <td class="priority">
                <xsl:value-of select="sitemap:priority"/>
              </td>
              <td class="changefreq">
                <xsl:value-of select="sitemap:changefreq"/>
              </td>
              <td class="lastmod">
                <xsl:value-of select="sitemap:lastmod"/>
              </td>
            </tr>
          </xsl:for-each>
        </table>
      </body>
    </html>
  </xsl:template>
</xsl:stylesheet> 