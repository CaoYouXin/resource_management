

我的目标是：__从头编写Web应用服务器，不使用Tomcat，Struts，Spring，Hibernate!__
---

`Serve 1.0`的架构中各个微服务可以相互调用，相互发消息。并且，各个微服务并不一定都在同一台机器部署。这时，就需要获取各个微服务启动的机器的`IP`地址。为此，编写了该工具类`NetUtil`。

```
public static InetAddress getLocalHostLANAddress() throws UnknownHostException {
  try {
    InetAddress candidateAddress = null;
    // Iterate all NICs (network interface cards)...
    for (Enumeration ifaces = NetworkInterface.getNetworkInterfaces(); ifaces.hasMoreElements(); ) {
      NetworkInterface iface = (NetworkInterface) ifaces.nextElement();
      // Iterate all IP addresses assigned to each card...
      for (Enumeration inetAddrs = iface.getInetAddresses(); inetAddrs.hasMoreElements(); ) {
        InetAddress inetAddr = (InetAddress) inetAddrs.nextElement();
        if (!inetAddr.isLoopbackAddress()) {

          if (inetAddr.isSiteLocalAddress()) {
            // Found non-loopback site-local address. Return it immediately...
            return inetAddr;
          } else if (candidateAddress == null) {
            // Found non-loopback address, but not necessarily site-local.
            // Store it as a candidate to be returned if site-local address is not subsequently found...
            candidateAddress = inetAddr;
            // Note that we don't repeatedly assign non-loopback non-site-local addresses as candidates,
            // only the first. For subsequent iterations, candidate will be non-null.
          }
        }
      }
    }
    if (candidateAddress != null) {
      // We did not find a site-local address, but we found some other non-loopback address.
      // Server might have a non-site-local address assigned to its NIC (or it might be running
      // IPv6 which deprecates the "site-local" concept).
      // Return this non-loopback candidate address...
      return candidateAddress;
    }
    // At this point, we did not find a non-loopback address.
    // Fall back to returning whatever InetAddress.getLocalHost() returns...
    InetAddress jdkSuppliedAddress = InetAddress.getLocalHost();
    if (jdkSuppliedAddress == null) {
      throw new UnknownHostException("The JDK InetAddress.getLocalHost() method unexpectedly returned null.");
    }
    return jdkSuppliedAddress;
  } catch (Exception e) {
    UnknownHostException unknownHostException = new UnknownHostException("Failed to determine LAN address: " + e);
    unknownHostException.initCause(e);
    throw unknownHostException;
  }
}
```

另外，从HTTP连接中获取访问服务的远程IP地址也是一个重要的应用。代码如下：

```
private static final String _255 = "(?:25[0-5]|2[0-4][0-9]|[01]?[0-9][0-9]?)";
private static final Pattern pattern = Pattern.compile("^(?:" + _255 + "\\.){3}" + _255 + "$");

private static String longToIpV4(long longIp) {
  int octet3 = (int) ((longIp >> 24) % 256);
  int octet2 = (int) ((longIp >> 16) % 256);
  int octet1 = (int) ((longIp >> 8) % 256);
  int octet0 = (int) ((longIp) % 256);

  return octet3 + "." + octet2 + "." + octet1 + "." + octet0;
}

private static long ipV4ToLong(String ip) {
  String[] octets = ip.split("\\.");
  return (Long.parseLong(octets[0]) << 24) + (Integer.parseInt(octets[1]) << 16)
          + (Integer.parseInt(octets[2]) << 8) + Integer.parseInt(octets[3]);
}

private static boolean isIPv4Private(String ip) {
  long longIp = ipV4ToLong(ip);
  return (longIp >= ipV4ToLong("10.0.0.0") && longIp <= ipV4ToLong("10.255.255.255"))
          || (longIp >= ipV4ToLong("172.16.0.0") && longIp <= ipV4ToLong("172.31.255.255"))
          || longIp >= ipV4ToLong("192.168.0.0") && longIp <= ipV4ToLong("192.168.255.255");
}

private static boolean isIPv4Valid(String ip) {
  return pattern.matcher(ip).matches();
}

public static String getIpFromRequest(HttpRequest request, HttpContext context) {
  String ip = null;
  boolean found = false;
  Header[] headers = request.getHeaders("x-forwarded-for");
  if (headers.length > 0 && (ip = headers[0].getValue()) != null) {
    StringTokenizer tokenizer = new StringTokenizer(ip, ",");
    while (tokenizer.hasMoreTokens()) {
      ip = tokenizer.nextToken().trim();
      if (isIPv4Valid(ip) && !isIPv4Private(ip)) {
        found = true;
        break;
      }
    }
  }

  if (!found) {
    HttpInetConnection connection = (HttpInetConnection) context.getAttribute(HttpCoreContext.HTTP_CONNECTION);
    InetAddress ia = connection.getRemoteAddress();
    ip = ia.getHostAddress();
  }

  return ip;
}
```

结束语
---

内容或许对专业进行网络编程的人来说很简单，但是但是大多数人平时不常接触这部分知识。上述代码沿用到Serve 2.0。